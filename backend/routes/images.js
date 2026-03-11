const express = require('express');
const { protect } = require('../middleware/auth');
const { getImage } = require('../utils/imageService');

const router = express.Router();

// Fetch image for any query
router.get('/search', protect, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Query required' });
    const url = await getImage(q);
    res.json({ url });
  } catch { res.status(500).json({ error: 'Image fetch failed' }); }
});

module.exports = router;
