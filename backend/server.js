require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');

const app = express();

// ── Middleware ────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// ── Rate Limiting ─────────────────────────────────────────
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { error: 'Too many requests. Please wait a moment.' } });
app.use('/api/', limiter);

// Stricter limit for AI generation (costs API quota)
const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 5, message: { error: 'Too many trip generations. Please wait 1 minute.' } });
app.use('/api/trips/generate', aiLimiter);

// ── MongoDB ───────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trip-planner')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => { console.error('❌ MongoDB error:', err.message); process.exit(1); });

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/users', require('./routes/users'));
app.use('/api/images', require('./routes/images'));

// ── Health Check ──────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Travel Recommendation System API running' }));

// ── 404 Handler ───────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Error Handler ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
