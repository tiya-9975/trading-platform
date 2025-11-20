const { mockStocks } = require('./stockData');

// Simulate real-time price updates
const simulatePriceUpdate = () => {
  const updates = {};
  
  Object.keys(mockStocks).forEach(symbol => {
    const stock = mockStocks[symbol];
    const changePercent = (Math.random() - 0.5) * 0.5; // -0.25% to +0.25%
    const priceChange = stock.price * (changePercent / 100);
    
    const newPrice = stock.price + priceChange;
    const newChange = stock.change + priceChange;
    const newChangePercent = (newChange / (stock.price - stock.change)) * 100;
    
    // Update the mock data
    mockStocks[symbol].price = parseFloat(newPrice.toFixed(2));
    mockStocks[symbol].change = parseFloat(newChange.toFixed(2));
    mockStocks[symbol].changePercent = parseFloat(newChangePercent.toFixed(2));
    
    updates[symbol] = {
      symbol,
      price: mockStocks[symbol].price,
      change: mockStocks[symbol].change,
      changePercent: mockStocks[symbol].changePercent
    };
  });
  
  return updates;
};

module.exports = { simulatePriceUpdate };