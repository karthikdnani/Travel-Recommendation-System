const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();

router.get('/profile', protect, async (req, res) => {
  res.json({ user: req.user });
});

router.put('/profile', protect, async (req, res) => {
  try {
    const { name, bio, preferences } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, bio, preferences }, { new: true }).select('-password');
    res.json({ user });
  } catch { res.status(500).json({ error: 'Update failed.' }); }
});

router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.comparePassword(currentPassword))) return res.status(400).json({ error: 'Current password is incorrect.' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated.' });
  } catch { res.status(500).json({ error: 'Password change failed.' }); }
});

module.exports = router;
