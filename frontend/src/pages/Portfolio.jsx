import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Briefcase } from 'lucide-react';
import { portfolioAPI } from '../services/api';

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      const response = await portfolioAPI.getSummary();
      setPortfolio(response.data);
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
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
            ${portfolio?.summary?.totalValue?.toFixed(2) || '0.00'}
          </p>
          <p className="text-xs text-green-600 mt-2">Portfolio value</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Invested</p>
          <p className="text-2xl font-bold text-gray-900">
            ${portfolio?.summary?.totalInvested?.toFixed(2) || '0.00'}
          </p>
          <p className="text-xs text-gray-600 mt-2">Capital deployed</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total P/L</p>
          <p className={`text-2xl font-bold ${
            parseFloat(portfolio?.summary?.totalProfitLoss) >= 0 
              ? 'text-green-600' 
              : 'text-red-600'
          }`}>
            ${portfolio?.summary?.totalProfitLoss?.toFixed(2) || '0.00'}
          </p>
          <p className={`text-xs mt-2 ${
            parseFloat(portfolio?.summary?.totalProfitLossPercent) >= 0 
              ? 'text-green-600' 
              : 'text-red-600'
          }`}>
            {portfolio?.summary?.totalProfitLossPercent?.toFixed(2) || '0.00'}%
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Cash Available</p>
          <p className="text-2xl font-bold text-gray-900">
            ${portfolio?.summary?.cash?.toFixed(2) || '0.00'}
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
                {portfolio.holdings.map((holding, index) => (
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
                    <td className="text-right py-4 px-4 text-white font-medium">{holding.quantity || 0}</td>
                    <td className="text-right py-4 px-4 text-white font-medium">
                      ${holding.averagePrice?.toFixed(2) || '0.00'}
                    </td>
                    <td className="text-right py-4 px-4 text-white font-medium">
                      ${holding.currentPrice?.toFixed(2) || '0.00'}
                    </td>
                    <td className="text-right py-4 px-4 text-white font-bold">
                      ${holding.totalValue?.toFixed(2) || '0.00'}
                    </td>
                    <td className="text-right py-4 px-4">
                      <div className="flex items-center justify-end gap-1">
                        {holding.profitLoss >= 0 ? (
                          <TrendingUp size={16} className="text-green-400" />
                        ) : (
                          <TrendingDown size={16} className="text-red-400" />
                        )}
                        <span className={`font-bold ${
                          holding.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          ${Math.abs(holding.profitLoss)?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </td>
                    <td className="text-right py-4 px-4">
                      <span className={`font-bold ${
                        holding.returnPercent >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {holding.returnPercent >= 0 ? '+' : ''}{holding.returnPercent?.toFixed(2) || '0.00'}%
                      </span>
                    </td>
                  </tr>
                ))}
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