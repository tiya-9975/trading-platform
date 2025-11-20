const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  symbol: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  shares: {
    type: Number,
    required: true
  },
  averagePrice: {
    type: Number,
    required: true
  },
  totalInvested: {
    type: Number,
    required: true
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  }
});

portfolioSchema.index({ userId: 1, symbol: 1 });

module.exports = mongoose.model('Portfolio', portfolioSchema);