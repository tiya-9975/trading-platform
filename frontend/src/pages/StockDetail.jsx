import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Eye, Bell, ShoppingCart } from 'lucide-react';
import { stocksAPI, watchlistAPI, alertsAPI, portfolioAPI } from '../services/api';

const StockDetail = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [alertPrice, setAlertPrice] = useState('');
  const [alertType, setAlertType] = useState('above');

  useEffect(() => {
    loadStock();
    checkWatchlist();
  }, [symbol]);

  const loadStock = async () => {
    try {
      const response = await stocksAPI.getBySymbol(symbol);
      setStock(response.data);
    } catch (error) {
      console.error('Failed to load stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkWatchlist = async () => {
    try {
      const response = await watchlistAPI.get();
      const exists = response.data.some(item => item.stock.symbol === symbol);
      setInWatchlist(exists);
    } catch (error) {
      console.error('Failed to check watchlist:', error);
    }
  };

  const handleWatchlist = async () => {
    try {
      if (inWatchlist) {
        await watchlistAPI.remove(stock._id);
        setInWatchlist(false);
      } else {
        await watchlistAPI.add(stock._id);
        setInWatchlist(true);
      }
    } catch (error) {
      console.error('Watchlist operation failed:', error);
    }
  };

  const handleBuy = async (e) => {
    e.preventDefault();
    try {
      await portfolioAPI.buy({
        stock: stock._id,
        quantity: parseInt(quantity),
        price: stock.price
      });
      setShowBuyModal(false);
      setQuantity(1);
      alert('Purchase successful!');
      navigate('/portfolio');
    } catch (error) {
      console.error('Purchase failed:', error);
      alert(error.response?.data?.message || 'Purchase failed');
    }
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    try {
      await alertsAPI.create({
        stock: stock._id,
        targetPrice: parseFloat(alertPrice),
        type: alertType
      });
      setShowAlertModal(false);
      setAlertPrice('');
      alert('Alert created successfully!');
    } catch (error) {
      console.error('Failed to create alert:', error);
      alert('Failed to create alert');
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
        <div className="text-center py-12">
          <p className="text-gray-600">Stock not found</p>
          <button
            onClick={() => navigate('/stocks')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg"
          >
            Back to Stocks
          </button>
        </div>
      </div>
    );
  }

  const totalCost = stock.price * quantity;

  return (
    <div className="p-6">
      <button
        onClick={() => navigate('/stocks')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to Stocks</span>
      </button>

      <div className="bg-white border border-gray-200 rounded-xl p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{stock.symbol}</h1>
            <p className="text-lg text-gray-600">{stock.name}</p>
          </div>
          {stock.change >= 0 ? (
            <TrendingUp className="text-green-500" size={48} />
          ) : (
            <TrendingDown className="text-red-500" size={48} />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Current Price</p>
            <p className="text-4xl font-bold text-gray-900">${stock.price}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Change</p>
            <p className={`text-3xl font-bold ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {stock.change >= 0 ? '+' : ''}{stock.change}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Volume</p>
            <p className="text-3xl font-bold text-gray-900">{stock.volume}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowBuyModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <ShoppingCart size={20} />
            Buy Stock
          </button>

          <button
            onClick={handleWatchlist}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium ${
              inWatchlist
                ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            <Eye size={20} />
            {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
          </button>

          <button
            onClick={() => setShowAlertModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-300 rounded-lg transition-colors font-medium"
          >
            <Bell size={20} />
            Create Alert
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-400 rounded-xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Market Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Market Cap</p>
            <p className="text-xl font-bold text-gray-900">{stock.marketCap || 'N/A'}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Volume</p>
            <p className="text-xl font-bold text-gray-900">{stock.volume}</p>
          </div>
        </div>
      </div>

      {/* Buy Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Buy {stock.symbol}</h2>
            
            <form onSubmit={handleBuy} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price per share</span>
                  <span className="font-semibold text-gray-900">${stock.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Quantity</span>
                  <span className="font-semibold text-gray-900">{quantity}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between">
                  <span className="font-semibold text-gray-900">Total Cost</span>
                  <span className="font-bold text-xl text-gray-900">${totalCost.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBuyModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Confirm Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Price Alert</h2>
            
            <form onSubmit={handleCreateAlert} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={alertPrice}
                  onChange={(e) => setAlertPrice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
                  placeholder="0.00"
                  required
                />
                <p className="text-sm text-gray-600 mt-1">Current price: ${stock.price}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alert Type
                </label>
                <select
                  value={alertType}
                  onChange={(e) => setAlertType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
                >
                  <option value="above">Price goes above target</option>
                  <option value="below">Price goes below target</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAlertModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Create Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockDetail;
