const express = require('express');
const auth = require('../middleware/auth');
const Watchlist = require('../models/Watchlist');

const router = express.Router();

// Get user watchlist
router.get('/', auth, async (req, res) => {
  try {
    const watchlist = await Watchlist.find({ userId: req.userId }).sort({ addedAt: -1 });
    res.json(watchlist);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

// Add to watchlist
router.post('/', auth, async (req, res) => {
  try {
    const { symbol, name } = req.body;

    if (!symbol || !name) {
      return res.status(400).json({ error: 'Symbol and name are required' });
    }

    // Check if already in watchlist
    const existing = await Watchlist.findOne({ userId: req.userId, symbol });
    if (existing) {
      return res.status(400).json({ error: 'Stock already in watchlist' });
    }

    const item = new Watchlist({
      userId: req.userId,
      symbol,
      name
    });

    await item.save();
    res.status(201).json(item);
  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({ error: 'Failed to add to watchlist' });
  }
});

// Remove from watchlist
router.delete('/:symbol', auth, async (req, res) => {
  try {
    const result = await Watchlist.deleteOne({
      userId: req.userId,
      symbol: req.params.symbol
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Stock not in watchlist' });
    }

    res.json({ message: 'Removed from watchlist' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove from watchlist' });
  }
});

// Check if stock is in watchlist
router.get('/check/:symbol', auth, async (req, res) => {
  try {
    const item = await Watchlist.findOne({
      userId: req.userId,
      symbol: req.params.symbol
    });

    res.json({ inWatchlist: !!item });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check watchlist' });
  }
});

module.exports = router;