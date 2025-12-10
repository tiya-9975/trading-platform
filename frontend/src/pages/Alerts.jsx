import { useState, useEffect } from 'react';
import { Bell, TrendingUp, TrendingDown, Trash2, Plus, X } from 'lucide-react';
import { alertsAPI, stocksAPI } from '../services/api';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newAlert, setNewAlert] = useState({
    stockId: '',  // Changed from 'stock' to 'stockId' for clarity
    targetPrice: '',
    type: 'above'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading alerts data...');
      
      const [alertsRes, stocksRes] = await Promise.all([
        alertsAPI.get(),
        stocksAPI.getAll()
      ]);
      
      console.log('Alerts:', alertsRes.data);
      console.log('Stocks:', stocksRes.data);
      
      setAlerts(alertsRes.data || []);
      setStocks(stocksRes.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      setError(error.message || 'Failed to load alerts');
      setAlerts([]);
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    try {
      // Find the selected stock to get its symbol and name
      const selectedStock = stocks.find(s => s._id === newAlert.stockId);
      
      if (!selectedStock) {
        alert('Please select a valid stock');
        return;
      }

      // Format data to match backend expectations
      const alertData = {
        symbol: selectedStock.symbol,           // Backend expects 'symbol'
        name: selectedStock.name,               // Backend expects 'name'
        targetPrice: parseFloat(newAlert.targetPrice), // Convert to number
        condition: newAlert.type                 // Backend expects 'condition'
      };

      console.log('Creating alert with data:', alertData);
      
      const response = await alertsAPI.create(alertData);
      console.log('Alert created successfully:', response.data);
      
      setShowModal(false);
      setNewAlert({ stockId: '', targetPrice: '', type: 'above' });
      loadData();
    } catch (error) {
      console.error('Failed to create alert:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      alert('Failed to create alert: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this alert?')) return;
    try {
      await alertsAPI.delete(id);
      loadData();
    } catch (error) {
      console.error('Failed to delete alert:', error);
      alert('Failed to delete alert');
    }
  };

  const handleActivate = async (id) => {
    try {
      await alertsAPI.update(id, { isActive: true });
      loadData();
    } catch (error) {
      console.error('Failed to activate alert:', error);
      alert('Failed to activate alert');
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading alerts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <Bell size={48} className="mx-auto text-red-400 mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Alerts</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={loadData}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
            <Bell size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-blue-600">Price Alerts</h1>
            <p className="text-sm text-gray-600">Get notified when prices hit your targets</p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          <Plus size={20} />
          Create Alert
        </button>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Bell size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No alerts set</h3>
          <p className="text-gray-500 mb-4">Create price alerts to stay informed about your stocks</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            Create Your First Alert
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alerts.map((alert) => (
            <div
              key={alert._id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{alert.symbol || 'N/A'}</h3>
                  <p className="text-sm text-gray-600">{alert.name || 'Unknown Stock'}</p>
                </div>
                <button
                  onClick={() => handleDelete(alert._id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} className="text-red-500" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-700">
                  {alert.condition === 'above' ? (
                    <TrendingUp className="text-green-500" size={20} />
                  ) : (
                    <TrendingDown className="text-red-500" size={20} />
                  )}
                  <span className="text-sm font-medium">
                    Alert when price goes {alert.condition}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">Target Price</p>
                  <p className="text-3xl font-bold text-gray-900">${alert.targetPrice}</p>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  {alert.isActive ? (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-600">Active</span>
                    </div>
                  ) : alert.triggered ? (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium text-yellow-600">Triggered</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleActivate(alert._id)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Click to Activate
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Alert Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Create Price Alert</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Stock
                </label>
                <select
                  value={newAlert.stockId}
                  onChange={(e) => setNewAlert({ ...newAlert, stockId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  required
                >
                  <option value="">Choose a stock</option>
                  {stocks.map((stock) => (
                    <option key={stock._id} value={stock._id}>
                      {stock.symbol} - {stock.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newAlert.targetPrice}
                  onChange={(e) => setNewAlert({ ...newAlert, targetPrice: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alert Type
                </label>
                <select
                  value={newAlert.type}
                  onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="above">Price goes above target</option>
                  <option value="below">Price goes below target</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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

export default Alerts;