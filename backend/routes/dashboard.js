const router = require('express').Router();
const { query } = require('../config/db');
const { protect, authorize } = require('../middleware/auth');

// GET /api/dashboard/owner — owner stats
router.get('/owner', protect, authorize('owner'), async (req, res) => {
  try {
    const [jobs, apps, hires, profile] = await Promise.all([
      query("SELECT COUNT(*) FROM jobs WHERE owner_id=$1 AND status='active'", [req.user.id]),
      query('SELECT COUNT(*) FROM applications a JOIN jobs j ON j.id=a.job_id WHERE j.owner_id=$1', [req.user.id]),
      query("SELECT COUNT(*) FROM applications a JOIN jobs j ON j.id=a.job_id WHERE j.owner_id=$1 AND a.status='hired'", [req.user.id]),
      query('SELECT rating, review_count FROM owner_profiles WHERE user_id=$1', [req.user.id]),
    ]);
    res.json({
      success: true,
      stats: {
        active_jobs:   parseInt(jobs.rows[0].count),
        total_apps:    parseInt(apps.rows[0].count),
        total_hires:   parseInt(hires.rows[0].count),
        rating:        profile.rows[0]?.rating || 0,
        review_count:  profile.rows[0]?.review_count || 0,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/dashboard/pro — professional stats
router.get('/pro', protect, authorize('professional'), async (req, res) => {
  try {
    const [total, shortlisted, hired, profile] = await Promise.all([
      query('SELECT COUNT(*) FROM applications WHERE applicant_id=$1', [req.user.id]),
      query("SELECT COUNT(*) FROM applications WHERE applicant_id=$1 AND status='shortlisted'", [req.user.id]),
      query("SELECT COUNT(*) FROM applications WHERE applicant_id=$1 AND status='hired'", [req.user.id]),
      query('SELECT rating, review_count, is_available FROM professional_profiles WHERE user_id=$1', [req.user.id]),
    ]);
    res.json({
      success: true,
      stats: {
        total_apps:   parseInt(total.rows[0].count),
        shortlisted:  parseInt(shortlisted.rows[0].count),
        hired:        parseInt(hired.rows[0].count),
        rating:       profile.rows[0]?.rating || 0,
        review_count: profile.rows[0]?.review_count || 0,
        is_available: profile.rows[0]?.is_available || false,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
