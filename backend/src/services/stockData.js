// Mock stock data - replace with real API later
const mockStocks = {
  AAPL: {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 178.45,
    change: 2.34,
    changePercent: 1.33,
    volume: '52.3M',
    marketCap: '2.83T',
    pe: 29.5,
    high52w: 198.23,
    low52w: 124.17
  },
  GOOGL: {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 142.65,
    change: -1.24,
    changePercent: -0.86,
    volume: '28.1M',
    marketCap: '1.79T',
    pe: 27.3,
    high52w: 153.78,
    low52w: 102.21
  },
  MSFT: {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 378.91,
    change: 4.56,
    changePercent: 1.22,
    volume: '22.4M',
    marketCap: '2.82T',
    pe: 35.1,
    high52w: 398.45,
    low52w: 309.45
  },
  AMZN: {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    price: 156.23,
    change: 3.12,
    changePercent: 2.04,
    volume: '45.6M',
    marketCap: '1.61T',
    pe: 78.4,
    high52w: 171.28,
    low52w: 118.35
  },
  TSLA: {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 242.84,
    change: -5.67,
    changePercent: -2.28,
    volume: '112.3M',
    marketCap: '771B',
    pe: 75.2,
    high52w: 299.29,
    low52w: 152.37
  },
  NVDA: {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 495.22,
    change: 8.91,
    changePercent: 1.83,
    volume: '38.7M',
    marketCap: '1.22T',
    pe: 98.6,
    high52w: 502.66,
    low52w: 276.58
  },
  META: {
    symbol: 'META',
    name: 'Meta Platforms Inc.',
    price: 358.67,
    change: 6.45,
    changePercent: 1.83,
    volume: '15.2M',
    marketCap: '913B',
    pe: 28.7,
    high52w: 384.33,
    low52w: 224.21
  },
  NFLX: {
    symbol: 'NFLX',
    name: 'Netflix Inc.',
    price: 445.78,
    change: -2.34,
    changePercent: -0.52,
    volume: '4.2M',
    marketCap: '192B',
    pe: 41.3,
    high52w: 485.23,
    low52w: 344.73
  }
};

// Generate historical data for charts
const generateHistoricalData = (symbol, days = 30) => {
  const stock = mockStocks[symbol];
  if (!stock) return [];

  const data = [];
  const basePrice = stock.price;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Add some randomness to create realistic chart
    const variance = (Math.random() - 0.5) * (basePrice * 0.05);
    const price = basePrice + variance - (i * 0.1);
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: Math.max(price, basePrice * 0.8),
      volume: Math.floor(Math.random() * 50000000) + 10000000
    });
  }
  
  return data;
};

const getAllStocks = () => {
  return Object.values(mockStocks);
};

const getStockBySymbol = (symbol) => {
  return mockStocks[symbol.toUpperCase()] || null;
};

const getStockPrice = (symbol) => {
  const stock = mockStocks[symbol.toUpperCase()];
  return stock ? stock.price : null;
};

const searchStocks = (query) => {
  const lowerQuery = query.toLowerCase();
  return Object.values(mockStocks).filter(stock => 
    stock.symbol.toLowerCase().includes(lowerQuery) ||
    stock.name.toLowerCase().includes(lowerQuery)
  );
};

module.exports = {
  getAllStocks,
  getStockBySymbol,
  getStockPrice,
  generateHistoricalData,
  searchStocks,
  mockStocks
};