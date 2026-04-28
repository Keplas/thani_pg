const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { query } = require('../config/db');
const { protect } = require('../middleware/auth');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role)
      return res.status(400).json({ success: false, message: 'All fields required' });
    if (!['owner', 'professional'].includes(role))
      return res.status(400).json({ success: false, message: 'Invalid role' });
    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const exists = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (exists.rows.length) return res.status(400).json({ success: false, message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const userRes = await query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name.trim(), email.toLowerCase(), hashed, role]
    );
    const user = userRes.rows[0];

    // Create blank profile
    if (role === 'owner') {
      await query('INSERT INTO owner_profiles (user_id, business_name) VALUES ($1, $2)', [user.id, name.trim()]);
    } else {
      await query('INSERT INTO professional_profiles (user_id, title) VALUES ($1, $2)', [user.id, 'Pharmacy Professional']);
    }

    res.status(201).json({ success: true, token: signToken(user.id), user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

    const result = await query('SELECT id, name, email, role, password FROM users WHERE email = $1', [email.toLowerCase()]);
    const user   = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const { password: _, ...safeUser } = user;
    res.json({ success: true, token: signToken(user.id), user: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;
