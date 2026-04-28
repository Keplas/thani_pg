const router = require('express').Router();
const { query } = require('../config/db');
const { protect, authorize } = require('../middleware/auth');

// Match score algorithm
const calcMatch = (job, profile) => {
  if (!profile) return 0;
  let score = 40;
  const jobSpecs  = job.specializations  || [];
  const proSpecs  = profile.specializations || [];
  const matches   = jobSpecs.filter(s => proSpecs.includes(s)).length;
  score += matches * 12;
  if (profile.city && job.city && profile.city.toLowerCase() === job.city.toLowerCase()) score += 15;
  if (profile.years_experience >= job.experience_min) score += 10;
  const workTypes = profile.work_types || [];
  if (workTypes.includes(job.job_type)) score += 10;
  if (profile.is_available) score += 5;
  return Math.min(score, 99);
};

// GET /api/jobs  — list with filters
router.get('/', protect, async (req, res) => {
  try {
    const { search, job_type, city, pay_min } = req.query;
    let sql = `
      SELECT j.*, u.name as owner_name
      FROM jobs j
      JOIN users u ON u.id = j.owner_id
      WHERE j.status = 'active'`;
    const params = [];
    let i = 1;
    if (search)   { sql += ` AND (j.title ILIKE $${i} OR j.description ILIKE $${i})`; params.push(`%${search}%`); i++; }
    if (job_type) { sql += ` AND j.job_type = $${i++}`; params.push(job_type); }
    if (city)     { sql += ` AND j.city ILIKE $${i++}`; params.push(`%${city}%`); }
    if (pay_min)  { sql += ` AND j.pay_min >= $${i++}`; params.push(Number(pay_min)); }
    sql += ' ORDER BY j.created_at DESC';

    const result = await query(sql, params);
    let jobs = result.rows;

    // Add match scores for professionals
    if (req.user.role === 'professional') {
      const profResult = await query('SELECT * FROM professional_profiles WHERE user_id = $1', [req.user.id]);
      const profile = profResult.rows[0];
      jobs = jobs.map(j => ({ ...j, match_score: calcMatch(j, profile) }));
      jobs.sort((a, b) => b.match_score - a.match_score);
    }

    res.json({ success: true, count: jobs.length, jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/jobs/my  — owner's own jobs
router.get('/my', protect, authorize('owner'), async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM jobs WHERE owner_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, count: result.rows.length, jobs: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/jobs/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const result = await query(`
      SELECT j.*, u.name as owner_name, u.email as owner_email
      FROM jobs j JOIN users u ON u.id = j.owner_id
      WHERE j.id = $1`, [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, job: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/jobs
router.post('/', protect, authorize('owner'), async (req, res) => {
  try {
    const { title, description, job_type, city, address, is_remote,
            pay_min, pay_max, pay_type, specializations, experience_min,
            openings, requirements, status } = req.body;
    if (!title || !description || !job_type)
      return res.status(400).json({ success: false, message: 'title, description and job_type required' });

    const result = await query(`
      INSERT INTO jobs (owner_id, title, description, job_type, city, address, is_remote,
        pay_min, pay_max, pay_type, specializations, experience_min, openings, requirements, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING *`,
      [req.user.id, title, description, job_type, city||'', address||'',
       is_remote||false, pay_min||0, pay_max||0, pay_type||'hourly',
       specializations||[], experience_min||0, openings||1, requirements||'', status||'active']);

    res.status(201).json({ success: true, job: result.rows[0] });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/jobs/:id
router.put('/:id', protect, authorize('owner'), async (req, res) => {
  try {
    const check = await query('SELECT id FROM jobs WHERE id = $1 AND owner_id = $2', [req.params.id, req.user.id]);
    if (!check.rows.length) return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });

    const b = req.body;
    const result = await query(`
      UPDATE jobs SET
        title           = COALESCE($1, title),
        description     = COALESCE($2, description),
        job_type        = COALESCE($3, job_type),
        city            = COALESCE($4, city),
        is_remote       = COALESCE($5, is_remote),
        pay_min         = COALESCE($6, pay_min),
        pay_max         = COALESCE($7, pay_max),
        pay_type        = COALESCE($8, pay_type),
        specializations = COALESCE($9, specializations),
        experience_min  = COALESCE($10, experience_min),
        openings        = COALESCE($11, openings),
        requirements    = COALESCE($12, requirements),
        status          = COALESCE($13, status),
        updated_at      = NOW()
      WHERE id = $14 RETURNING *`,
      [b.title, b.description, b.job_type, b.city, b.is_remote, b.pay_min, b.pay_max,
       b.pay_type, b.specializations, b.experience_min, b.openings, b.requirements, b.status, req.params.id]);

    res.json({ success: true, job: result.rows[0] });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/jobs/:id
router.delete('/:id', protect, authorize('owner'), async (req, res) => {
  try {
    const result = await query('DELETE FROM jobs WHERE id = $1 AND owner_id = $2 RETURNING id', [req.params.id, req.user.id]);
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/jobs/:id/applications
router.get('/:id/applications', protect, authorize('owner'), async (req, res) => {
  try {
    const jobCheck = await query('SELECT * FROM jobs WHERE id = $1 AND owner_id = $2', [req.params.id, req.user.id]);
    if (!jobCheck.rows.length) return res.status(403).json({ success: false, message: 'Not your job' });

    const result = await query(`
      SELECT a.*, u.name as applicant_name, u.email as applicant_email,
             pp.title as applicant_title, pp.years_experience, pp.city as applicant_city,
             pp.specializations, pp.rating, pp.is_verified
      FROM applications a
      JOIN users u ON u.id = a.applicant_id
      LEFT JOIN professional_profiles pp ON pp.user_id = a.applicant_id
      WHERE a.job_id = $1
      ORDER BY a.match_score DESC, a.applied_at ASC`, [req.params.id]);

    res.json({ success: true, count: result.rows.length, job: jobCheck.rows[0], applications: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
