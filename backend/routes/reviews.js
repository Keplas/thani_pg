const router = require('express').Router();
const { query } = require('../config/db');
const { protect } = require('../middleware/auth');

// POST /api/reviews
router.post('/', protect, async (req, res) => {
  try {
    const { reviewee_id, job_id, rating, review_text } = req.body;
    if (!reviewee_id || !rating) return res.status(400).json({ success: false, message: 'reviewee_id and rating required' });
    if (rating < 1 || rating > 5) return res.status(400).json({ success: false, message: 'Rating must be 1-5' });

    const result = await query(
      'INSERT INTO reviews (reviewer_id, reviewee_id, job_id, rating, review_text) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [req.user.id, reviewee_id, job_id || null, rating, review_text || '']
    );

    // Recalculate average rating
    const avg = await query(
      'SELECT ROUND(AVG(rating),1) as avg, COUNT(*) as cnt FROM reviews WHERE reviewee_id = $1',
      [reviewee_id]
    );
    const { avg: newRating, cnt } = avg.rows[0];

    // Update in correct profile table
    const userRes = await query('SELECT role FROM users WHERE id = $1', [reviewee_id]);
    if (userRes.rows.length) {
      const table = userRes.rows[0].role === 'owner' ? 'owner_profiles' : 'professional_profiles';
      await query(`UPDATE ${table} SET rating = $1, review_count = $2 WHERE user_id = $3`, [newRating, cnt, reviewee_id]);
    }

    res.status(201).json({ success: true, review: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/reviews/:userId
router.get('/:userId', protect, async (req, res) => {
  try {
    const result = await query(`
      SELECT r.*, u.name as reviewer_name, u.role as reviewer_role
      FROM reviews r
      JOIN users u ON u.id = r.reviewer_id
      WHERE r.reviewee_id = $1
      ORDER BY r.created_at DESC`, [req.params.userId]);
    res.json({ success: true, count: result.rows.length, reviews: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
