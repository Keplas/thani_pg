// ── profiles.js ──────────────────────────────────────────────
const express = require('express');
const pRouter = express.Router();
const pCtrl   = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

pRouter.get('/me',              protect, pCtrl.getMyProfile);
pRouter.put('/me',              protect, pCtrl.updateMyProfile);
pRouter.get('/professionals',   protect, pCtrl.searchProfessionals);
pRouter.get('/:userId',         protect, pCtrl.getPublicProfile);

// ── applications.js ───────────────────────────────────────────
const aRouter = express.Router();
const aCtrl   = require('../controllers/applicationController');
const { authorize } = require('../middleware/auth');

aRouter.post('/job/:jobId',   protect, authorize('professional'), aCtrl.apply);
aRouter.get('/my',            protect, authorize('professional'), aCtrl.myApplications);
aRouter.put('/:id/status',    protect, authorize('owner'),        aCtrl.updateStatus);

// ── reviews.js ────────────────────────────────────────────────
const rRouter = express.Router();
const rCtrl   = require('../controllers/reviewController');

rRouter.post('/',             protect, rCtrl.postReview);
rRouter.get('/:userId',       protect, rCtrl.getUserReviews);

module.exports = { pRouter, aRouter, rRouter };
