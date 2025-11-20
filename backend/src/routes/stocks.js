const express = require('express');
const auth = require('../middleware/auth');
const { getAllStocks, getStockBySymbol, generateHistoricalData, searchStocks } = require('../services/stockData');

const router = express.Router();

// Get all stocks
router.get('/', auth, (req, res) => {
  try {
    const stocks = getAllStocks();
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stocks' });
  }
});

// Search stocks
router.get('/search', auth, (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }
    
    const results = searchStocks(q);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get stock details
router.get('/:symbol', auth, (req, res) => {
  try {
    const stock = getStockBySymbol(req.params.symbol);
    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    res.json(stock);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stock details' });
  }
});

// Get stock historical data
router.get('/:symbol/history', auth, (req, res) => {
  try {
    const { days = 30 } = req.query;
    const history = generateHistoricalData(req.params.symbol, parseInt(days));
    
    if (history.length === 0) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

module.exports = router;