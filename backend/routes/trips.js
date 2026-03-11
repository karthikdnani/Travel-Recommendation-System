const express = require('express');
const { body, validationResult } = require('express-validator');
const Trip = require('../models/Trip');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { generateItinerary } = require('../utils/geminiAI');
const { addImagesToTrip } = require('../utils/imageService');

const router = express.Router();

// ── Generate Trip with Gemini AI ──────────────────────────
router.post('/generate', protect, [
  body('origin').notEmpty().withMessage('Origin city is required'),
  body('destination').notEmpty().withMessage('Destination city is required'),
  body('numberOfDays').isInt({ min: 1, max: 30 }).withMessage('Days must be between 1 and 30'),
  body('budget').isNumeric().withMessage('Budget must be a number'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  const { origin, destination, numberOfDays, budget, interests = [], travelers = 1, startDate, currency = 'USD' } = req.body;

  try {
    // 1. Call Gemini AI
    let tripData = await generateItinerary({
      origin, destination,
      days: parseInt(numberOfDays),
      budget: parseFloat(budget),
      interests,
      travelers: parseInt(travelers),
      startDate,
    });

    // 2. Add images (Unsplash)
    tripData = await addImagesToTrip(tripData);

    // 3. Save to MongoDB
    const trip = await Trip.create({
      user: req.user._id,
      title: tripData.title,
      origin: tripData.origin,
      destination: tripData.destination,
      startDate,
      numberOfDays: parseInt(numberOfDays),
      travelers: parseInt(travelers),
      budget: { total: parseFloat(budget), currency, perDay: Math.round(budget / numberOfDays) },
      interests,
      itinerary: tripData.itinerary,
      hotels: tripData.hotels,
      costBreakdown: tripData.costBreakdown,
      estimatedTotalCost: tripData.estimatedTotalCost,
      route: tripData.route,
      summary: tripData.summary,
      travelTips: tripData.travelTips,
      bestTimeToVisit: tripData.bestTimeToVisit,
      coverImage: tripData.coverImage,
    });

    // 4. Update user trip count
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalTrips: 1 } });

    res.status(201).json({ message: 'Trip generated successfully!', trip });

  } catch (error) {
    console.error('Generation error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to generate trip. Please try again.' });
  }
});

// ── Get All Trips ─────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const { status } = req.query;
    const query = { user: req.user._id };
    if (status && status !== 'all') query.status = status;

    const trips = await Trip.find(query)
      .sort({ createdAt: -1 })
      .select('-itinerary -hotels -route -travelTips'); // lightweight for list view

    res.json({ trips });
  } catch {
    res.status(500).json({ error: 'Failed to fetch trips.' });
  }
});

// ── Get Single Trip ───────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
    if (!trip) return res.status(404).json({ error: 'Trip not found.' });
    res.json({ trip });
  } catch {
    res.status(500).json({ error: 'Failed to fetch trip.' });
  }
});

// ── Update Trip Status ────────────────────────────────────
router.put('/:id', protect, async (req, res) => {
  try {
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!trip) return res.status(404).json({ error: 'Trip not found.' });
    res.json({ trip });
  } catch {
    res.status(500).json({ error: 'Failed to update trip.' });
  }
});

// ── Delete Trip ───────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!trip) return res.status(404).json({ error: 'Trip not found.' });
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalTrips: -1 } });
    res.json({ message: 'Trip deleted.' });
  } catch {
    res.status(500).json({ error: 'Failed to delete trip.' });
  }
});

// ── Dashboard Stats ───────────────────────────────────────
router.get('/user/dashboard', protect, async (req, res) => {
  try {
    const [total, completed, planned, ongoing] = await Promise.all([
      Trip.countDocuments({ user: req.user._id }),
      Trip.countDocuments({ user: req.user._id, status: 'completed' }),
      Trip.countDocuments({ user: req.user._id, status: 'planned' }),
      Trip.countDocuments({ user: req.user._id, status: 'ongoing' }),
    ]);

    const recentTrips = await Trip.find({ user: req.user._id })
      .sort({ createdAt: -1 }).limit(4)
      .select('title destination numberOfDays budget status coverImage createdAt');

    res.json({ stats: { total, completed, planned, ongoing }, recentTrips });
  } catch {
    res.status(500).json({ error: 'Failed to load dashboard.' });
  }
});

module.exports = router;
