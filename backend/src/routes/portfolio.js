const express = require('express');
const auth = require('../middleware/auth');
const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
const { getStockPrice } = require('../services/stockData');

const router = express.Router();

// Get user portfolio
router.get('/', auth, async (req, res) => {
  try {
    const holdings = await Portfolio.find({ userId: req.userId });
    res.json(holdings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

// Buy stock
router.post('/buy', auth, async (req, res) => {
  try {
    const { symbol, name, shares, price } = req.body;

    if (!symbol || !name || !shares || !price) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (shares <= 0) {
      return res.status(400).json({ error: 'Shares must be positive' });
    }

    const totalCost = shares * price;
    const user = await User.findById(req.userId);

    if (user.balance < totalCost) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Update user balance
    user.balance -= totalCost;
    await user.save();

    // Check if user already owns this stock
    let holding = await Portfolio.findOne({ userId: req.userId, symbol });

    if (holding) {
      // Update existing holding
      const newTotalShares = holding.shares + shares;
      const newTotalInvested = holding.totalInvested + totalCost;
      holding.shares = newTotalShares;
      holding.totalInvested = newTotalInvested;
      holding.averagePrice = newTotalInvested / newTotalShares;
      await holding.save();
    } else {
      // Create new holding
      holding = new Portfolio({
        userId: req.userId,
        symbol,
        name,
        shares,
        averagePrice: price,
        totalInvested: totalCost
      });
      await holding.save();
    }

    res.json({
      message: 'Purchase successful',
      holding,
      newBalance: user.balance
    });
  } catch (error) {
    console.error('Buy error:', error);
    res.status(500).json({ error: 'Purchase failed' });
  }
});

// Sell stock
router.post('/sell', auth, async (req, res) => {
  try {
    const { symbol, shares, price } = req.body;

    if (!symbol || !shares || !price) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (shares <= 0) {
      return res.status(400).json({ error: 'Shares must be positive' });
    }

    const holding = await Portfolio.findOne({ userId: req.userId, symbol });

    if (!holding) {
      return res.status(404).json({ error: 'Stock not in portfolio' });
    }

    if (holding.shares < shares) {
      return res.status(400).json({ error: 'Insufficient shares' });
    }

    const totalRevenue = shares * price;
    const user = await User.findById(req.userId);

    // Update user balance
    user.balance += totalRevenue;
    await user.save();

    // Update or remove holding
    if (holding.shares === shares) {
      await Portfolio.deleteOne({ _id: holding._id });
    } else {
      const soldCost = (holding.totalInvested / holding.shares) * shares;
      holding.shares -= shares;
      holding.totalInvested -= soldCost;
      await holding.save();
    }

    res.json({
      message: 'Sale successful',
      revenue: totalRevenue,
      newBalance: user.balance
    });
  } catch (error) {
    console.error('Sell error:', error);
    res.status(500).json({ error: 'Sale failed' });
  }
});

// Get portfolio summary
router.get('/summary', auth, async (req, res) => {
  try {
    const holdings = await Portfolio.find({ userId: req.userId });
    const user = await User.findById(req.userId);

    let totalValue = 0;
    let totalInvested = 0;
    const holdingsWithCurrentValue = [];

    for (const holding of holdings) {
      const currentPrice = getStockPrice(holding.symbol) || holding.averagePrice;
      const currentValue = holding.shares * currentPrice;
      const profitLoss = currentValue - holding.totalInvested;
      const profitLossPercent = (profitLoss / holding.totalInvested) * 100;

      totalValue += currentValue;
      totalInvested += holding.totalInvested;

      holdingsWithCurrentValue.push({
        ...holding.toObject(),
        currentPrice,
        currentValue,
        profitLoss,
        profitLossPercent
      });
    }

    const totalProfitLoss = totalValue - totalInvested;
    const totalProfitLossPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

    res.json({
      holdings: holdingsWithCurrentValue,
      summary: {
        totalValue: totalValue.toFixed(2),
        totalInvested: totalInvested.toFixed(2),
        totalProfitLoss: totalProfitLoss.toFixed(2),
        totalProfitLossPercent: totalProfitLossPercent.toFixed(2),
        cash: user.balance.toFixed(2),
        accountValue: (totalValue + user.balance).toFixed(2)
      }
    });
  } catch (error) {
    console.error('Portfolio summary error:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio summary' });
  }
});

module.exports = router;