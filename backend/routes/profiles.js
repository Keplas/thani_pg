const router = require('express').Router();
const { query } = require('../config/db');
const { protect } = require('../middleware/auth');

// GET /api/profiles/me
router.get('/me', protect, async (req, res) => {
  try {
    let result;
    if (req.user.role === 'owner') {
      result = await query(`
        SELECT op.*, u.name, u.email, u.phone
        FROM owner_profiles op
        JOIN users u ON u.id = op.user_id
        WHERE op.user_id = $1`, [req.user.id]);
    } else {
      result = await query(`
        SELECT pp.*, u.name, u.email, u.phone
        FROM professional_profiles pp
        JOIN users u ON u.id = pp.user_id
        WHERE pp.user_id = $1`, [req.user.id]);
    }
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, profile: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/profiles/me
router.put('/me', protect, async (req, res) => {
  try {
    const b = req.body;
    let result;
    if (req.user.role === 'owner') {
      result = await query(`
        UPDATE owner_profiles SET
          business_name  = COALESCE($1, business_name),
          license_number = COALESCE($2, license_number),
          city           = COALESCE($3, city),
          address        = COALESCE($4, address),
          phone          = COALESCE($5, phone),
          services       = COALESCE($6, services),
          about          = COALESCE($7, about),
          website        = COALESCE($8, website),
          updated_at     = NOW()
        WHERE user_id = $9
        RETURNING *`,
        [b.business_name, b.license_number, b.city, b.address, b.phone,
         b.services, b.about, b.website, req.user.id]);
    } else {
      result = await query(`
        UPDATE professional_profiles SET
          title            = COALESCE($1, title),
          years_experience = COALESCE($2, years_experience),
          specializations  = COALESCE($3, specializations),
          work_types       = COALESCE($4, work_types),
          city             = COALESCE($5, city),
          max_radius_km    = COALESCE($6, max_radius_km),
          bio              = COALESCE($7, bio),
          license_number   = COALESCE($8, license_number),
          hourly_rate_min  = COALESCE($9, hourly_rate_min),
          hourly_rate_max  = COALESCE($10, hourly_rate_max),
          is_available     = COALESCE($11, is_available),
          updated_at       = NOW()
        WHERE user_id = $12
        RETURNING *`,
        [b.title, b.years_experience, b.specializations, b.work_types,
         b.city, b.max_radius_km, b.bio, b.license_number,
         b.hourly_rate_min, b.hourly_rate_max, b.is_available, req.user.id]);
    }
    res.json({ success: true, profile: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/profiles/professionals
router.get('/professionals', protect, async (req, res) => {
  try {
    const { city, specialization, work_type, available } = req.query;
    let sql = `
      SELECT pp.*, u.name, u.email
      FROM professional_profiles pp
      JOIN users u ON u.id = pp.user_id
      WHERE 1=1`;
    const params = [];
    let i = 1;
    if (city)           { sql += ` AND pp.city ILIKE $${i++}`;          params.push(`%${city}%`); }
    if (specialization) { sql += ` AND $${i++} = ANY(pp.specializations)`; params.push(specialization); }
    if (work_type)      { sql += ` AND $${i++} = ANY(pp.work_types)`;    params.push(work_type); }
    if (available)      { sql += ` AND pp.is_available = true`; }
    sql += ' ORDER BY pp.rating DESC, pp.years_experience DESC';

    const result = await query(sql, params);
    res.json({ success: true, count: result.rows.length, profiles: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/profiles/:userId
router.get('/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    let result = await query(`
      SELECT op.*, u.name, u.email, u.role FROM owner_profiles op
      JOIN users u ON u.id = op.user_id WHERE op.user_id = $1`, [userId]);
    if (!result.rows.length) {
      result = await query(`
        SELECT pp.*, u.name, u.email, u.role FROM professional_profiles pp
        JOIN users u ON u.id = pp.user_id WHERE pp.user_id = $1`, [userId]);
    }
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, profile: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
