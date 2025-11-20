const express = require('express');
const auth = require('../middleware/auth');
const {
  getPrediction,
  getRecommendations,
  getNewsSummary,
  getPortfolioAdvice,
  processChatMessage
} = require('../services/aiAgent');
const Portfolio = require('../models/Portfolio');
const User = require('../models/User');

const router = express.Router();

// Get stock prediction
router.get('/predict/:symbol', auth, async (req, res) => {
  try {
    const prediction = await getPrediction(req.params.symbol);
    
    if (!prediction) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    
    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate prediction' });
  }
});

// Get recommendations
router.get('/recommendations', auth, async (req, res) => {
  try {
    const recommendations = await getRecommendations();
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Get news summary
router.get('/news/:symbol', auth, (req, res) => {
  try {
    const news = getNewsSummary(req.params.symbol);
    
    if (!news) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news summary' });
  }
});

// Get portfolio advice
router.get('/portfolio-advice', auth, async (req, res) => {
  try {
    const holdings = await Portfolio.find({ userId: req.userId });
    const totalValue = holdings.reduce((sum, h) => sum + (h.shares * h.averagePrice), 0);
    
    const advice = getPortfolioAdvice(holdings, totalValue);
    res.json(advice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate portfolio advice' });
  }
});

// Process chat message (AI chatbot with actions)
router.post('/chat', auth, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const user = await User.findById(req.userId);
    const result = await processChatMessage(
      message, 
      req.userId, 
      user.balance,
      Portfolio,
      User
    );
    
    // If balance was updated, send new balance
    if (result.action === 'buy_stock' && result.data) {
      const updatedUser = await User.findById(req.userId);
      result.newBalance = updatedUser.balance;
    }
    
    res.json(result);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      response: 'Sorry, I encountered an error. Please try again.'
    });
  }
});

// Get multiple predictions
router.post('/predictions/batch', auth, async (req, res) => {
  try {
    const { symbols } = req.body;
    
    if (!symbols || !Array.isArray(symbols)) {
      return res.status(400).json({ error: 'Symbols array is required' });
    }
    
    const predictions = await Promise.all(
      symbols.map(symbol => getPrediction(symbol))
    );
    
    res.json(predictions.filter(p => p !== null));
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate predictions' });
  }
});

module.exports = router;