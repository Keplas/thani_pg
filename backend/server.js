require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');

// Init DB connection
require('./config/db');

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/profiles',     require('./routes/profiles'));
app.use('/api/jobs',         require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/reviews',      require('./routes/reviews'));
app.use('/api/dashboard',    require('./routes/dashboard'));

// ── Health ──────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({
  status: 'OK',
  project: 'Project Thani v2 — PostgreSQL Edition',
  timestamp: new Date().toISOString(),
}));

// ── 404 ─────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));

// ── Global error ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌', err.stack);
  res.status(500).json({ success: false, message: 'Server error', error: err.message });
});

// ── Start ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🚀  Project Thani API  v2.0 — PostgreSQL');
  console.log(`  📡  http://localhost:${PORT}/api`);
  console.log(`  🩺  http://localhost:${PORT}/api/health`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});
