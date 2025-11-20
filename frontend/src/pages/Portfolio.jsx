import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
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

  if (!portfolio || portfolio.holdings.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Portfolio</h1>
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <DollarSign size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Holdings Yet</h2>
          <p className="text-gray-600 mb-6">Start building your portfolio by buying stocks</p>
          <Link 
            to="/"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Browse Stocks
          </Link>
        </div>
      </div>
    );
  }

  const { summary, holdings } = portfolio;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">My Portfolio</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Value</p>
          <p className="text-2xl font-bold text-gray-900">${summary.totalValue}</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Invested</p>
          <p className="text-2xl font-bold text-gray-900">${summary.totalInvested}</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total P/L</p>
          <p className={`text-2xl font-bold ${parseFloat(summary.totalProfitLoss) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${summary.totalProfitLoss}
          </p>
          <p className={`text-xs mt-1 ${parseFloat(summary.totalProfitLossPercent) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {summary.totalProfitLossPercent}%
          </p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Cash Available</p>
          <p className="text-2xl font-bold text-gray-900">${summary.cash}</p>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Holdings</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shares
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  P/L
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Return
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {holdings.map((holding) => (
                <tr key={holding._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      to={`/stock/${holding.symbol}`}
                      className="font-medium text-primary-600 hover:text-primary-800"
                    >
                      {holding.symbol}
                    </Link>
                    <p className="text-sm text-gray-500">{holding.name}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {holding.shares}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${holding.averagePrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${holding.currentPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${holding.currentValue.toFixed(2)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${holding.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <div className="flex items-center gap-1">
                      {holding.profitLoss >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      ${Math.abs(holding.profitLoss).toFixed(2)}
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${holding.profitLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {holding.profitLossPercent >= 0 ? '+' : ''}{holding.profitLossPercent.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
