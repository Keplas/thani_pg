const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { query } = require('../config/db');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

const userResponse = (user, token) => ({
  success: true,
  token,
  user: { id: user.id, name: user.name, email: user.email, role: user.role }
});

// ── REGISTER ─────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role)
      return res.status(400).json({ success: false, message: 'All fields are required' });
    if (!['owner', 'professional'].includes(role))
      return res.status(400).json({ success: false, message: 'Role must be owner or professional' });
    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    // Check email exists
    const exists = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (exists.rows.length)
      return res.status(400).json({ success: false, message: 'Email already registered' });

    // Hash password
    const hash = await bcrypt.hash(password, 12);

    // Create user
    const { rows: [user] } = await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4) RETURNING id, name, email, role`,
      [name.trim(), email.toLowerCase(), hash, role]
    );

    // Create matching profile
    if (role === 'owner') {
      await query(
        'INSERT INTO owner_profiles (user_id, business_name) VALUES ($1, $2)',
        [user.id, name.trim()]
      );
    } else {
      await query(
        'INSERT INTO professional_profiles (user_id, title) VALUES ($1, $2)',
        [user.id, 'Pharmacy Professional']
      );
    }

    res.status(201).json(userResponse(user, signToken(user.id)));
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// ── LOGIN ─────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required' });

    const { rows } = await query(
      'SELECT id, name, email, role, password_hash FROM users WHERE email = $1 AND is_active = TRUE',
      [email.toLowerCase()]
    );
    if (!rows.length)
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    res.json(userResponse(user, signToken(user.id)));
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// ── GET ME ────────────────────────────────────────────────────
exports.getMe = (req, res) => {
  res.json({ success: true, user: req.user });
};
