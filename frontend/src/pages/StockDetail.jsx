import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Eye, ShoppingCart } from 'lucide-react';
import { stocksAPI, watchlistAPI, portfolioAPI, aiAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StockChart from '../components/charts/StockChart';

const StockDetail = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  const [stock, setStock] = useState(null);
  const [history, setHistory] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [shares, setShares] = useState(1);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    loadData();
  }, [symbol]);

  const loadData = async () => {
    try {
      const [stockRes, historyRes, predictionRes, watchlistRes] = await Promise.all([
        stocksAPI.getBySymbol(symbol),
        stocksAPI.getHistory(symbol, 30),
        aiAPI.getPrediction(symbol),
        watchlistAPI.check(symbol)
      ]);
      
      setStock(stockRes.data);
      setHistory(historyRes.data);
      setPrediction(predictionRes.data);
      setInWatchlist(watchlistRes.data.inWatchlist);
    } catch (error) {
      console.error('Failed to load stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async () => {
    if (shares <= 0) {
      alert('Please enter a valid number of shares');
      return;
    }

    const totalCost = shares * stock.price;
    if (totalCost > user.balance) {
      alert('Insufficient balance');
      return;
    }

    setBuying(true);
    try {
      const response = await portfolioAPI.buy({
        symbol: stock.symbol,
        name: stock.name,
        shares: parseInt(shares),
        price: stock.price
      });
      
      updateUser({ ...user, balance: response.data.newBalance });
      alert('Purchase successful!');
      setShares(1);
    } catch (error) {
      alert(error.response?.data?.error || 'Purchase failed');
    } finally {
      setBuying(false);
    }
  };

  const toggleWatchlist = async () => {
    try {
      if (inWatchlist) {
        await watchlistAPI.remove(symbol);
        setInWatchlist(false);
      } else {
        await watchlistAPI.add({ symbol: stock.symbol, name: stock.name });
        setInWatchlist(true);
      }
    } catch (error) {
      alert('Failed to update watchlist');
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Stock not found</p>
      </div>
    );
  }

  const totalCost = (shares * stock.price).toFixed(2);

  return (
    <div className="p-6 space-y-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      {/* Stock Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{stock.symbol}</h1>
            <p className="text-gray-600 mt-1">{stock.name}</p>
          </div>
          
          <button
            onClick={toggleWatchlist}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              inWatchlist 
                ? 'bg-primary-50 border-primary-200 text-primary-600' 
                : 'border-gray-300 text-gray-600 hover:border-primary-300'
            }`}
          >
            <Eye size={20} />
            {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
          </button>
        </div>

        <div className="mt-6 flex items-end gap-4">
          <div>
            <p className="text-4xl font-bold text-gray-900">${stock.price}</p>
          </div>
          <div className={`flex items-center gap-1 pb-2 ${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stock.changePercent >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
            <span className="text-xl font-semibold">
              {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%
            </span>
            <span className="text-sm">
              ({stock.changePercent >= 0 ? '+' : ''}${stock.change})
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-4 gap-4 pt-4 border-t border-gray-100">
          <div>
            <p className="text-sm text-gray-500">Market Cap</p>
            <p className="text-lg font-semibold text-gray-900">{stock.marketCap}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Volume</p>
            <p className="text-lg font-semibold text-gray-900">{stock.volume}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">P/E Ratio</p>
            <p className="text-lg font-semibold text-gray-900">{stock.pe}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">52W Range</p>
            <p className="text-lg font-semibold text-gray-900">${stock.low52w} - ${stock.high52w}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Price Chart (30 Days)</h2>
          <StockChart data={history} />
        </div>

        {/* Buy Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Trade</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Shares
              </label>
              <input
                type="number"
                min="1"
                value={shares}
                onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Price per share</span>
                <span className="font-medium">${stock.price}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Shares</span>
                <span className="font-medium">{shares}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-medium text-gray-900">Total Cost</span>
                <span className="font-bold text-gray-900">${totalCost}</span>
              </div>
            </div>

            <button
              onClick={handleBuy}
              disabled={buying || totalCost > user.balance}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShoppingCart size={20} />
              {buying ? 'Processing...' : 'Buy Now'}
            </button>

            {totalCost > user.balance && (
              <p className="text-sm text-red-600 text-center">Insufficient balance</p>
            )}
          </div>
        </div>
      </div>

      {/* AI Prediction */}
      {prediction && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 shadow-sm border border-purple-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">AI Prediction</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Trend Prediction</p>
              <p className="text-2xl mb-2">{prediction.icon}</p>
              <p className="font-semibold text-gray-900">{prediction.prediction}</p>
              <p className="text-xs text-gray-600 mt-1">Confidence: {prediction.confidence}%</p>
            </div>

            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Target Price</p>
              <p className="text-2xl font-bold text-gray-900">${prediction.targetPrice}</p>
              <p className="text-xs text-gray-600 mt-1">Timeframe: {prediction.timeframe}</p>
            </div>

            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-2">Key Factors</p>
              <ul className="space-y-1">
  {(prediction.reasoning ?? ["No detailed insights available"]).slice(0, 2).map((reason, idx) => (
    <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
      <span className="text-green-600">•</span>
      <span>{reason}</span>
    </li>
  ))}
</ul>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockDetail;
