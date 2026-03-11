const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, generateToken } = require('../middleware/auth');

const router = express.Router();

// ── Register ──────────────────────────────────────────────
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  const { name, email, password, interests = [] } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered.' });

    const user = await User.create({ name, email, password, preferences: { interests } });
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: { _id: user._id, name: user.name, email: user.email, preferences: user.preferences, totalTrips: 0 },
    });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

// ── Login ─────────────────────────────────────────────────
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const token = generateToken(user._id);
    res.json({
      message: 'Login successful!',
      token,
      user: { _id: user._id, name: user.name, email: user.email, preferences: user.preferences, totalTrips: user.totalTrips, createdAt: user.createdAt },
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.' });
  }
});

// ── Get current user ──────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
