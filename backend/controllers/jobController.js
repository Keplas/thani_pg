const { query } = require('../config/db');

// Match score algorithm
const computeMatch = (job, profile) => {
  if (!profile) return 0;
  let score = 40;
  const jobSpecs  = job.specializations  || [];
  const profSpecs = profile.specializations || [];
  const specHits  = jobSpecs.filter(s => profSpecs.includes(s)).length;
  score += specHits * 12;
  if (profile.city && job.city && profile.city.toLowerCase() === job.city.toLowerCase()) score += 15;
  if (profile.years_experience >= (job.experience_min || 0)) score += 10;
  const workTypes = profile.work_types || [];
  if (workTypes.includes(job.job_type)) score += 10;
  if (profile.is_available) score += 5;
  return Math.min(score, 99);
};

// ── LIST JOBS ─────────────────────────────────────────────────
exports.listJobs = async (req, res) => {
  try {
    const { search, job_type, city, pay_min, specialization } = req.query;
    let sql = `
      SELECT j.*, u.name AS owner_name
      FROM jobs j
      JOIN users u ON u.id = j.owner_id
      WHERE j.status = 'active'
    `;
    const params = [];
    let i = 1;

    if (search) {
      sql += ` AND (j.title ILIKE $${i} OR j.description ILIKE $${i})`;
      params.push(`%${search}%`); i++;
    }
    if (job_type)  { sql += ` AND j.job_type = $${i}`;              params.push(job_type);  i++; }
    if (city)      { sql += ` AND j.city ILIKE $${i}`;              params.push(`%${city}%`); i++; }
    if (pay_min)   { sql += ` AND j.pay_min >= $${i}`;              params.push(Number(pay_min)); i++; }
    if (specialization) { sql += ` AND $${i} = ANY(j.specializations)`; params.push(specialization); i++; }

    sql += ' ORDER BY j.created_at DESC';

    const { rows: jobs } = await query(sql, params);

    // Add match scores for professionals
    if (req.user.role === 'professional') {
      const { rows: [profile] } = await query(
        'SELECT * FROM professional_profiles WHERE user_id = $1', [req.user.id]
      );
      const scored = jobs.map(j => ({ ...j, match_score: computeMatch(j, profile) }));
      scored.sort((a, b) => b.match_score - a.match_score);
      return res.json({ success: true, count: scored.length, jobs: scored });
    }

    res.json({ success: true, count: jobs.length, jobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── MY JOBS (owner) ───────────────────────────────────────────
exports.myJobs = async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT * FROM jobs WHERE owner_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, count: rows.length, jobs: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET ONE JOB ───────────────────────────────────────────────
exports.getJob = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT j.*, u.name AS owner_name, u.email AS owner_email
       FROM jobs j JOIN users u ON u.id = j.owner_id
       WHERE j.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, job: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── CREATE JOB ────────────────────────────────────────────────
exports.createJob = async (req, res) => {
  try {
    const {
      title, description, job_type, city = '', address = '',
      is_remote = false, pay_min = 0, pay_max = 0, pay_type = 'hourly',
      specializations = [], experience_min = 0, openings = 1,
      requirements = '', status = 'active'
    } = req.body;

    if (!title || !description || !job_type)
      return res.status(400).json({ success: false, message: 'title, description and job_type are required' });

    const { rows: [job] } = await query(
      `INSERT INTO jobs
        (owner_id, title, description, job_type, city, address, is_remote,
         pay_min, pay_max, pay_type, specializations, experience_min,
         openings, requirements, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING *`,
      [req.user.id, title, description, job_type, city, address, is_remote,
       pay_min, pay_max, pay_type, specializations, experience_min,
       openings, requirements, status]
    );
    res.status(201).json({ success: true, job });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── UPDATE JOB ────────────────────────────────────────────────
exports.updateJob = async (req, res) => {
  try {
    const { rows: [existing] } = await query(
      'SELECT id FROM jobs WHERE id = $1 AND owner_id = $2',
      [req.params.id, req.user.id]
    );
    if (!existing) return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });

    const fields = ['title','description','job_type','city','address','is_remote',
                    'pay_min','pay_max','pay_type','specializations','experience_min',
                    'openings','requirements','status'];
    const updates = [];
    const vals    = [];
    let i = 1;

    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = $${i}`);
        vals.push(req.body[f]);
        i++;
      }
    });
    updates.push(`updated_at = NOW()`);
    vals.push(req.params.id);

    const { rows: [job] } = await query(
      `UPDATE jobs SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
      vals
    );
    res.json({ success: true, job });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── DELETE JOB ────────────────────────────────────────────────
exports.deleteJob = async (req, res) => {
  try {
    const { rowCount } = await query(
      'DELETE FROM jobs WHERE id = $1 AND owner_id = $2',
      [req.params.id, req.user.id]
    );
    if (!rowCount) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── JOB APPLICATIONS (owner view) ────────────────────────────
exports.jobApplications = async (req, res) => {
  try {
    // Verify job belongs to this owner
    const { rows: [job] } = await query(
      'SELECT * FROM jobs WHERE id = $1 AND owner_id = $2',
      [req.params.id, req.user.id]
    );
    if (!job) return res.status(403).json({ success: false, message: 'Not authorized for this job' });

    const { rows } = await query(
      `SELECT a.*, u.name AS applicant_name, u.email AS applicant_email,
              pp.title AS applicant_title, pp.years_experience,
              pp.specializations AS applicant_specs, pp.city AS applicant_city,
              pp.rating AS applicant_rating
       FROM applications a
       JOIN users u ON u.id = a.applicant_id
       LEFT JOIN professional_profiles pp ON pp.user_id = a.applicant_id
       WHERE a.job_id = $1
       ORDER BY a.match_score DESC, a.applied_at ASC`,
      [req.params.id]
    );
    res.json({ success: true, count: rows.length, job, applications: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
