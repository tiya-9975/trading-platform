import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Briefcase, AlertCircle } from 'lucide-react';
import { portfolioAPI } from '../services/api';

// Helper function to safely format numbers
const formatNumber = (value, decimals = 2) => {
  const num = parseFloat(value);
  return isNaN(num) ? '0.00' : num.toFixed(decimals);
};

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading portfolio...');
      
      const response = await portfolioAPI.getSummary();
      console.log('Full API response:', response);
      
      const data = response.data || response;
      console.log('Portfolio data:', data);
      
      if (!data) {
        throw new Error('No data received from API');
      }
      
      setPortfolio(data);
    } catch (error) {
      console.error('Failed to load portfolio:', error);
      setError(error.message || 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Portfolio</h3>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={loadPortfolio}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
            <AlertCircle size={48} className="mx-auto text-yellow-600 mb-4" />
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">No Portfolio Data</h3>
            <p className="text-yellow-700 mb-4">Portfolio data is empty</p>
            <button
              onClick={loadPortfolio}
              className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
          <Briefcase size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-blue-600">My Portfolio</h1>
          <p className="text-sm text-gray-600">Track your investments and performance</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Value</p>
          <p className="text-2xl font-bold text-gray-900">
            ${formatNumber(portfolio?.summary?.totalValue)}
          </p>
          <p className="text-xs text-green-600 mt-2">Portfolio value</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Invested</p>
          <p className="text-2xl font-bold text-gray-900">
            ${formatNumber(portfolio?.summary?.totalInvested)}
          </p>
          <p className="text-xs text-gray-600 mt-2">Capital deployed</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total P/L</p>
          <p className={`text-2xl font-bold ${
            parseFloat(portfolio?.summary?.totalProfitLoss || 0) >= 0 
              ? 'text-green-600' 
              : 'text-red-600'
          }`}>
            ${formatNumber(portfolio?.summary?.totalProfitLoss)}
          </p>
          <p className={`text-xs mt-2 ${
            parseFloat(portfolio?.summary?.totalProfitLossPercent || 0) >= 0 
              ? 'text-green-600' 
              : 'text-red-600'
          }`}>
            {formatNumber(portfolio?.summary?.totalProfitLossPercent)}%
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Cash Available</p>
          <p className="text-2xl font-bold text-gray-900">
            ${formatNumber(portfolio?.summary?.cash)}
          </p>
          <p className="text-xs text-gray-600 mt-2">Available to invest</p>
        </div>
      </div>

      {/* Holdings Table - DARK THEME */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 shadow-xl border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-6">Holdings</h2>

        {!portfolio?.holdings || portfolio.holdings.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">No holdings yet</h3>
            <p className="text-gray-500">Start investing to see your portfolio grow</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Stock</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Shares</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Avg Price</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Current Price</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Total Value</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">P/L</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Return</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.holdings.map((holding, index) => {
                  const profitLoss = parseFloat(holding.profitLoss || 0);
                  const returnPercent = parseFloat(holding.returnPercent || 0);
                  
                  return (
                    <tr 
                      key={holding._id || index}
                      className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-bold text-white text-lg">{holding.stock?.symbol || 'N/A'}</p>
                          <p className="text-sm text-gray-400">{holding.stock?.name || 'Unknown'}</p>
                        </div>
                      </td>
                      <td className="text-right py-4 px-4 text-white font-medium">
                        {holding.quantity || 0}
                      </td>
                      <td className="text-right py-4 px-4 text-white font-medium">
                        ${formatNumber(holding.averagePrice)}
                      </td>
                      <td className="text-right py-4 px-4 text-white font-medium">
                        ${formatNumber(holding.currentPrice)}
                      </td>
                      <td className="text-right py-4 px-4 text-white font-bold">
                        ${formatNumber(holding.totalValue)}
                      </td>
                      <td className="text-right py-4 px-4">
                        <div className="flex items-center justify-end gap-1">
                          {profitLoss >= 0 ? (
                            <TrendingUp size={16} className="text-green-400" />
                          ) : (
                            <TrendingDown size={16} className="text-red-400" />
                          )}
                          <span className={`font-bold ${
                            profitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {profitLoss >= 0 ? '+' : ''}${formatNumber(profitLoss)}
                          </span>
                        </div>
                      </td>
                      <td className="text-right py-4 px-4">
                        <span className={`font-bold ${
                          returnPercent >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {returnPercent >= 0 ? '+' : ''}{formatNumber(returnPercent)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Performance Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-400 rounded-xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Best Performer</p>
            <p className="text-lg font-bold text-green-600">
              {portfolio?.holdings?.[0]?.stock?.symbol || 'N/A'}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Positions</p>
            <p className="text-lg font-bold text-gray-900">
              {portfolio?.holdings?.length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Diversification</p>
            <p className="text-lg font-bold text-blue-600">
              {portfolio?.holdings?.length > 3 ? 'Good' : 'Low'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;