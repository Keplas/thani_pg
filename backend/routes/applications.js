const router = require('express').Router();
const { query } = require('../config/db');
const { protect, authorize } = require('../middleware/auth');

// POST /api/applications/:jobId — apply
router.post('/:jobId', protect, authorize('professional'), async (req, res) => {
  try {
    const job = await query("SELECT * FROM jobs WHERE id = $1 AND status = 'active'", [req.params.jobId]);
    if (!job.rows.length) return res.status(404).json({ success: false, message: 'Job not available' });

    const existing = await query(
      'SELECT id FROM applications WHERE job_id = $1 AND applicant_id = $2',
      [req.params.jobId, req.user.id]
    );
    if (existing.rows.length) return res.status(400).json({ success: false, message: 'Already applied to this job' });

    const result = await query(`
      INSERT INTO applications (job_id, applicant_id, cover_note, match_score)
      VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.params.jobId, req.user.id, req.body.cover_note || '', req.body.match_score || 0]
    );

    await query('UPDATE jobs SET application_count = application_count + 1 WHERE id = $1', [req.params.jobId]);

    res.status(201).json({ success: true, application: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/applications/my
router.get('/my', protect, authorize('professional'), async (req, res) => {
  try {
    const result = await query(`
      SELECT a.*,
             j.title as job_title, j.job_type, j.city as job_city,
             j.pay_min, j.pay_max, j.pay_type, j.status as job_status,
             u.name as owner_name
      FROM applications a
      JOIN jobs j ON j.id = a.job_id
      JOIN users u ON u.id = j.owner_id
      WHERE a.applicant_id = $1
      ORDER BY a.applied_at DESC`, [req.user.id]);
    res.json({ success: true, count: result.rows.length, applications: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/applications/:id/status — owner updates status
router.put('/:id/status', protect, authorize('owner'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending','shortlisted','rejected','hired'].includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status' });

    // Verify job belongs to this owner
    const check = await query(`
      SELECT a.id FROM applications a
      JOIN jobs j ON j.id = a.job_id
      WHERE a.id = $1 AND j.owner_id = $2`, [req.params.id, req.user.id]);
    if (!check.rows.length) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const result = await query(
      'UPDATE applications SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    res.json({ success: true, application: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
