const { query } = require('../config/db');

// ── GET MY PROFILE ────────────────────────────────────────────
exports.getMyProfile = async (req, res) => {
  try {
    const table = req.user.role === 'owner' ? 'owner_profiles' : 'professional_profiles';
    const { rows } = await query(
      `SELECT p.*, u.name, u.email, u.phone FROM ${table} p
       JOIN users u ON u.id = p.user_id
       WHERE p.user_id = $1`,
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, profile: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── UPDATE MY PROFILE ─────────────────────────────────────────
exports.updateMyProfile = async (req, res) => {
  try {
    const isOwner = req.user.role === 'owner';
    const table   = isOwner ? 'owner_profiles' : 'professional_profiles';

    const ownerFields = ['business_name','license_number','city','country','address','phone','services','about','website'];
    const proFields   = ['title','years_experience','specializations','work_types','city','country',
                         'max_radius_km','bio','license_number','hourly_rate_min','hourly_rate_max','is_available'];
    const allowed = isOwner ? ownerFields : proFields;

    const updates = [];
    const vals    = [];
    let i = 1;

    allowed.forEach(f => {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = $${i}`);
        vals.push(req.body[f]);
        i++;
      }
    });

    if (!updates.length)
      return res.status(400).json({ success: false, message: 'No valid fields to update' });

    updates.push(`updated_at = NOW()`);
    vals.push(req.user.id);

    const { rows: [profile] } = await query(
      `UPDATE ${table} SET ${updates.join(', ')} WHERE user_id = $${i} RETURNING *`,
      vals
    );
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── SEARCH PROFESSIONALS ──────────────────────────────────────
exports.searchProfessionals = async (req, res) => {
  try {
    const { city, specialization, work_type, available } = req.query;
    let sql = `
      SELECT pp.*, u.name, u.email
      FROM professional_profiles pp
      JOIN users u ON u.id = pp.user_id
      WHERE 1=1
    `;
    const params = [];
    let i = 1;

    if (city)           { sql += ` AND pp.city ILIKE $${i}`;             params.push(`%${city}%`);       i++; }
    if (specialization) { sql += ` AND $${i} = ANY(pp.specializations)`;  params.push(specialization);    i++; }
    if (work_type)      { sql += ` AND $${i} = ANY(pp.work_types)`;       params.push(work_type);         i++; }
    if (available)      { sql += ` AND pp.is_available = TRUE`; }

    sql += ' ORDER BY pp.rating DESC, pp.years_experience DESC';

    const { rows } = await query(sql, params);
    res.json({ success: true, count: rows.length, profiles: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET PUBLIC PROFILE ────────────────────────────────────────
exports.getPublicProfile = async (req, res) => {
  try {
    const uid = req.params.userId;
    // Try owner first
    let { rows } = await query(
      'SELECT op.*, u.name, u.email FROM owner_profiles op JOIN users u ON u.id = op.user_id WHERE op.user_id = $1',
      [uid]
    );
    if (!rows.length) {
      const r2 = await query(
        'SELECT pp.*, u.name, u.email FROM professional_profiles pp JOIN users u ON u.id = pp.user_id WHERE pp.user_id = $1',
        [uid]
      );
      rows = r2.rows;
    }
    if (!rows.length) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, profile: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
