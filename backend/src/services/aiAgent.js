const { getStockBySymbol, mockStocks, getAllStocks } = require('./stockData');

// Simple prediction without AI API
const getPrediction = async (symbol) => {
  const stock = getStockBySymbol(symbol);
  if (!stock) return null;

  let prediction, confidence;
  
  if (stock.changePercent > 1.5) {
    prediction = { trend: 'uptrend', icon: '📈', label: 'Strong Uptrend', color: 'green' };
    confidence = 85;
  } else if (stock.changePercent > 0.5) {
    prediction = { trend: 'uptrend', icon: '📈', label: 'Likely Uptrend', color: 'green' };
    confidence = 72;
  } else if (stock.changePercent < -1.5) {
    prediction = { trend: 'downtrend', icon: '📉', label: 'Bearish Trend', color: 'red' };
    confidence = 80;
  } else if (stock.changePercent < -0.5) {
    prediction = { trend: 'downtrend', icon: '📉', label: 'Slightly Bearish', color: 'red' };
    confidence = 68;
  } else {
    prediction = { trend: 'sideways', icon: '➡️', label: 'Sideways Movement', color: 'yellow' };
    confidence = 75;
  }

  const reasoning = [
    `Current momentum is ${stock.changePercent >= 0 ? 'positive' : 'negative'} at ${Math.abs(stock.changePercent)}%`,
    `Trading volume indicates ${stock.changePercent >= 0 ? 'buying' : 'selling'} pressure`,
    `Market sentiment for ${stock.name} remains ${stock.changePercent >= 0 ? 'optimistic' : 'cautious'}`
  ];

  const targetMultiplier = stock.changePercent >= 0 ? 1.05 : 0.95;
  const targetPrice = (stock.price * targetMultiplier).toFixed(2);

  return {
    symbol: stock.symbol,
    name: stock.name,
    currentPrice: stock.price,
    prediction: prediction.label,
    icon: prediction.icon,
    confidence: confidence,
    color: prediction.color,
    reasoning: reasoning,
    targetPrice: targetPrice,
    timeframe: '1-2 weeks'
  };
};

// Get recommendations
const getRecommendations = async () => {
  const stocks = getAllStocks();
  const topGainers = stocks
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 3)
    .map(stock => ({
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price,
      change: stock.changePercent,
      reason: stock.changePercent > 1 ? 'Strong upward momentum' : 'Positive price action'
    }));

  return {
    topPicks: topGainers,
    riskLevel: 'Moderate',
    diversificationScore: 75,
    suggestions: [
      'Consider tech stocks for growth potential',
      'Balance portfolio with stable blue-chip stocks',
      'Monitor market trends and adjust positions accordingly'
    ]
  };
};

// News summary
const getNewsSummary = (symbol) => {
  const stock = getStockBySymbol(symbol);
  if (!stock) return null;

  return {
    symbol: stock.symbol,
    sentiment: stock.changePercent > 0 ? 'Positive' : 'Negative',
    summary: `${stock.name} is showing ${stock.changePercent >= 0 ? 'positive momentum' : 'downward pressure'} with ${Math.abs(stock.changePercent)}% change today. Market analysts are ${stock.changePercent > 1 ? 'optimistic' : stock.changePercent < -1 ? 'cautious' : 'monitoring'} the stock's performance.`,
    keyPoints: [
      `Price movement: ${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent}%`,
      `Trading volume: ${stock.volume}`,
      `Market sentiment: ${stock.changePercent > 0 ? 'Bullish' : 'Bearish'}`
    ],
    sources: 3
  };
};

// Portfolio advice
const getPortfolioAdvice = (portfolio, totalValue) => {
  return {
    overallHealth: 'Good',
    riskScore: 65,
    diversificationAdvice: 'Consider adding more sectors for better diversification',
    recommendations: [
      {
        type: 'Rebalance',
        action: 'Review position sizes',
        reason: 'Maintain balanced exposure across holdings'
      },
      {
        type: 'Add Position',
        action: 'Consider healthcare or consumer stocks',
        reason: 'Diversify into defensive sectors'
      },
      {
        type: 'Monitor',
        action: 'Watch high-volatility positions',
        reason: 'Manage risk in volatile market conditions'
      }
    ],
    projectedReturn: {
      conservative: '8-12%',
      moderate: '12-18%',
      aggressive: '18-25%'
    }
  };
};

// Smart chatbot without external API
async function processChatMessage(message, userId, userBalance, Portfolio, User) {
  const lowerMessage = message.toLowerCase();
  
  // Detect stock symbol - improved matching
  let symbol = null;
  
  // First try exact symbol match
  for (const sym of Object.keys(mockStocks)) {
    if (lowerMessage.includes(sym.toLowerCase())) {
      symbol = sym;
      break;
    }
  }
  
  // If no symbol found, try company name matching (more flexible)
  if (!symbol) {
    if (lowerMessage.includes('apple')) symbol = 'AAPL';
    else if (lowerMessage.includes('google') || lowerMessage.includes('alphabet')) symbol = 'GOOGL';
    else if (lowerMessage.includes('microsoft')) symbol = 'MSFT';
    else if (lowerMessage.includes('amazon')) symbol = 'AMZN';
    else if (lowerMessage.includes('tesla')) symbol = 'TSLA';
    else if (lowerMessage.includes('nvidia')) symbol = 'NVDA';
    else if (lowerMessage.includes('meta') || lowerMessage.includes('facebook')) symbol = 'META';
    else if (lowerMessage.includes('netflix')) symbol = 'NFLX';
  }
  
  // Extract number of shares - improved pattern
  const sharesMatch = message.match(/(\d+)\s*(share|stock)/i);
  const shares = sharesMatch ? parseInt(sharesMatch[1]) : null;
  
  // PRICE QUERY
  if ((lowerMessage.includes('price') || lowerMessage.includes('cost') || 
       lowerMessage.includes('trading') || lowerMessage.includes('worth')) && symbol) {
    const stock = mockStocks[symbol];
    const changeText = stock.changePercent >= 0 ? 'up' : 'down';
    const response = `${stock.name} (${stock.symbol}) is currently trading at $${stock.price}, ${changeText} ${Math.abs(stock.changePercent)}% today. ${stock.changePercent > 1 ? 'Strong performance!' : stock.changePercent < -1 ? 'Experiencing downward pressure.' : 'Steady movement.'}`;
    
    return {
      type: 'price_query',
      response: response,
      data: stock
    };
  }
  
  // BUY ORDER - improved detection
  if ((lowerMessage.includes('buy') || lowerMessage.includes('purchase') || 
       lowerMessage.includes('get') || lowerMessage.includes('invest')) && symbol) {
    
    // If shares not specified in message, default to 1 or extract differently
    let finalShares = shares;
    if (!finalShares) {
      // Try to extract number before "shares of" or just any number
      const numMatch = message.match(/(\d+)/);
      finalShares = numMatch ? parseInt(numMatch[1]) : 5; // Default to 5 if not specified
    }
    
    try {
      const stock = mockStocks[symbol];
      const totalCost = finalShares * stock.price;
      const user = await User.findById(userId);

      if (user.balance < totalCost) {
        return {
          type: 'insufficient_balance',
          response: `Sorry, you don't have enough balance. You need ${totalCost.toFixed(2)} but only have ${user.balance.toFixed(2)}. Consider buying fewer shares or adding funds.`,
          data: null
        };
      }

      // Execute buy
      user.balance -= totalCost;
      await user.save();

      let holding = await Portfolio.findOne({ userId, symbol });
      if (holding) {
        const newTotalShares = holding.shares + finalShares;
        const newTotalInvested = holding.totalInvested + totalCost;
        holding.shares = newTotalShares;
        holding.totalInvested = newTotalInvested;
        holding.averagePrice = newTotalInvested / newTotalShares;
        await holding.save();
      } else {
        holding = new Portfolio({
          userId,
          symbol,
          name: stock.name,
          shares: finalShares,
          averagePrice: stock.price,
          totalInvested: totalCost
        });
        await holding.save();
      }

      const response = `✅ Order executed! Successfully bought ${finalShares} shares of ${stock.name} (${stock.symbol}) at ${stock.price} per share. Total cost: ${totalCost.toFixed(2)}. Your new balance is ${user.balance.toFixed(2)}. Good luck with your investment!`;

      return {
        type: 'buy_success',
        response: response,
        action: 'buy_stock',
        data: { symbol, shares: finalShares, price: stock.price, totalCost, newBalance: user.balance },
        newBalance: user.balance
      };
    } catch (error) {
      return {
        type: 'buy_error',
        response: `Sorry, there was an error processing your order. Please try again or contact support.`,
        data: null
      };
    }
  }
  
  // PORTFOLIO QUERY
  if (lowerMessage.includes('portfolio') || lowerMessage.includes('holdings') || 
      lowerMessage.includes('stocks i own') || lowerMessage.includes('what do i have')) {
    try {
      const holdings = await Portfolio.find({ userId });
      if (holdings.length === 0) {
        return {
          type: 'portfolio_empty',
          response: 'Your portfolio is currently empty. You haven\'t purchased any stocks yet. Browse the market and make your first investment!',
          data: null
        };
      }
      
      const summary = holdings.map(h => 
        `${h.symbol}: ${h.shares} shares at avg $${h.averagePrice.toFixed(2)}`
      ).join(', ');
      
      const totalValue = holdings.reduce((sum, h) => sum + (h.shares * h.averagePrice), 0);
      const response = `Your portfolio has ${holdings.length} position(s): ${summary}. Total invested: $${totalValue.toFixed(2)}. Keep monitoring your investments!`;
      
      return {
        type: 'portfolio_query',
        response: response,
        action: 'get_portfolio',
        data: holdings
      };
    } catch (error) {
      return {
        type: 'error',
        response: 'Sorry, I couldn\'t fetch your portfolio. Please try again.',
        data: null
      };
    }
  }
  
  // RECOMMENDATIONS
  if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || 
      lowerMessage.includes('should i buy') || lowerMessage.includes('what to invest')) {
    const recs = await getRecommendations();
    const picksSummary = recs.topPicks.map(p => 
      `${p.symbol} (${p.name}) at $${p.price}, ${p.change >= 0 ? '+' : ''}${p.change}%`
    ).join(', ');
    
    const response = `Based on today's market performance, I recommend: ${picksSummary}. These stocks are showing strong momentum. Remember to diversify and invest wisely!`;
    
    return {
      type: 'recommendation',
      response: response,
      action: 'get_recommendations',
      data: recs
    };
  }
  
  // BALANCE QUERY
  if (lowerMessage.includes('balance') || lowerMessage.includes('how much money') || 
      lowerMessage.includes('cash')) {
    return {
      type: 'balance',
      response: `Your available balance is $${userBalance.toFixed(2)}. You can use this to purchase stocks. What would you like to invest in?`,
      data: { balance: userBalance }
    };
  }
  
  // HELP / GENERAL
  return {
    type: 'general',
    response: `I'm your trading assistant! I can help you:
• Check stock prices: "What's the price of Apple?"
• Buy stocks: "Buy 5 shares of Tesla"
• View portfolio: "Show me my portfolio"
• Get recommendations: "What should I invest in?"
• Check balance: "What's my balance?"

What would you like to do?`,
    data: null
  };
}

module.exports = {
  getPrediction,
  getRecommendations,
  getNewsSummary,
  getPortfolioAdvice,
  processChatMessage
};