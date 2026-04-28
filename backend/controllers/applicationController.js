const { query } = require('../config/db');

// ── APPLY TO JOB ──────────────────────────────────────────────
exports.apply = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Check job exists and is active
    const { rows: [job] } = await query(
      "SELECT id, status FROM jobs WHERE id = $1",
      [jobId]
    );
    if (!job || job.status !== 'active')
      return res.status(404).json({ success: false, message: 'Job not available' });

    // Check not already applied
    const { rows: [existing] } = await query(
      'SELECT id FROM applications WHERE job_id = $1 AND applicant_id = $2',
      [jobId, req.user.id]
    );
    if (existing)
      return res.status(400).json({ success: false, message: 'You already applied to this job' });

    const { cover_note = '', match_score = 0 } = req.body;

    const { rows: [app] } = await query(
      `INSERT INTO applications (job_id, applicant_id, cover_note, match_score)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [jobId, req.user.id, cover_note, match_score]
    );

    // Increment application count
    await query('UPDATE jobs SET application_count = application_count + 1 WHERE id = $1', [jobId]);

    res.status(201).json({ success: true, application: app });
  } catch (err) {
    if (err.code === '23505')
      return res.status(400).json({ success: false, message: 'Already applied to this job' });
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── MY APPLICATIONS (professional) ───────────────────────────
exports.myApplications = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT a.*,
              j.title AS job_title, j.job_type, j.city AS job_city,
              j.pay_min, j.pay_max, j.pay_type, j.status AS job_status,
              u.name AS owner_name
       FROM applications a
       JOIN jobs j    ON j.id = a.job_id
       JOIN users u   ON u.id = j.owner_id
       WHERE a.applicant_id = $1
       ORDER BY a.applied_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, count: rows.length, applications: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── UPDATE APPLICATION STATUS (owner) ────────────────────────
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['pending','shortlisted','rejected','hired'];
    if (!valid.includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status value' });

    // Verify the application belongs to one of owner's jobs
    const { rows: [app] } = await query(
      `SELECT a.id FROM applications a
       JOIN jobs j ON j.id = a.job_id
       WHERE a.id = $1 AND j.owner_id = $2`,
      [req.params.id, req.user.id]
    );
    if (!app) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const { rows: [updated] } = await query(
      `UPDATE applications SET status = $1, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );
    res.json({ success: true, application: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
