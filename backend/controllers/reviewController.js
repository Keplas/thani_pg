const { query } = require('../config/db');

// ── POST REVIEW ───────────────────────────────────────────────
exports.postReview = async (req, res) => {
  try {
    const { reviewee_id, job_id, rating, review_text = '' } = req.body;
    if (!reviewee_id || !rating)
      return res.status(400).json({ success: false, message: 'reviewee_id and rating are required' });

    const { rows: [review] } = await query(
      `INSERT INTO reviews (reviewer_id, reviewee_id, job_id, rating, review_text)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, reviewee_id, job_id || null, rating, review_text]
    );

    // Recalculate average rating for reviewee
    const { rows: [avg] } = await query(
      'SELECT AVG(rating)::NUMERIC(3,2) AS avg, COUNT(*) AS cnt FROM reviews WHERE reviewee_id = $1',
      [reviewee_id]
    );

    // Update the correct profile table
    const { rows: [revieweeUser] } = await query('SELECT role FROM users WHERE id = $1', [reviewee_id]);
    if (revieweeUser) {
      const table = revieweeUser.role === 'owner' ? 'owner_profiles' : 'professional_profiles';
      await query(
        `UPDATE ${table} SET rating = $1, review_count = $2 WHERE user_id = $3`,
        [avg.avg, avg.cnt, reviewee_id]
      );
    }

    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET REVIEWS FOR USER ──────────────────────────────────────
exports.getUserReviews = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT r.*, u.name AS reviewer_name, u.role AS reviewer_role
       FROM reviews r
       JOIN users u ON u.id = r.reviewer_id
       WHERE r.reviewee_id = $1
       ORDER BY r.created_at DESC`,
      [req.params.userId]
    );
    res.json({ success: true, count: rows.length, reviews: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
