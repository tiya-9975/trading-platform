import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, TrendingUp, TrendingDown, X } from 'lucide-react';
import { watchlistAPI, stocksAPI } from '../services/api';
import { wsService } from '../services/websocket';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [stocks, setStocks] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWatchlist();
    
    wsService.connect();
    wsService.addListener(handlePriceUpdate);
    
    return () => {
      wsService.removeListener(handlePriceUpdate);
    };
  }, []);

  const loadWatchlist = async () => {
    try {
      const response = await watchlistAPI.get();
      setWatchlist(response.data);
      
      // Load stock data for each watchlist item
      const stockData = {};
      for (const item of response.data) {
        try {
          const stockRes = await stocksAPI.getBySymbol(item.symbol);
          stockData[item.symbol] = stockRes.data;
        } catch (error) {
          console.error(`Failed to load ${item.symbol}:`, error);
        }
      }
      setStocks(stockData);
    } catch (error) {
      console.error('Failed to load watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePriceUpdate = (data) => {
    if (data.type === 'price_update' && data.data) {
      setStocks(prev => {
        const updated = { ...prev };
        Object.keys(data.data).forEach(symbol => {
          if (updated[symbol]) {
            updated[symbol] = {
              ...updated[symbol],
              ...data.data[symbol]
            };
          }
        });
        return updated;
      });
    }
  };

  const handleRemove = async (symbol) => {
    try {
      await watchlistAPI.remove(symbol);
      setWatchlist(prev => prev.filter(item => item.symbol !== symbol));
      setStocks(prev => {
        const updated = { ...prev };
        delete updated[symbol];
        return updated;
      });
    } catch (error) {
      console.error('Failed to remove from watchlist:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (watchlist.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Watchlist</h1>
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <Eye size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Stocks in Watchlist</h2>
          <p className="text-gray-600 mb-6">Add stocks to keep track of their performance</p>
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

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">My Watchlist</h1>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {watchlist.map((item) => {
          const stock = stocks[item.symbol];
          
          return (
            <div key={item._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative group">
              <button
                onClick={() => handleRemove(item.symbol)}
                className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={18} />
              </button>

              <Link to={`/stock/${item.symbol}`}>
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{item.symbol}</h3>
                  <p className="text-sm text-gray-500">{item.name}</p>
                </div>

                {stock ? (
                  <>
                    <div className="flex items-end justify-between mb-3">
                      <p className="text-2xl font-bold text-gray-900">${stock.price}</p>
                      <div className={`flex items-center gap-1 ${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stock.changePercent >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                        <span className="font-semibold">
                          {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500">Volume</p>
                        <p className="text-sm font-medium text-gray-900">{stock.volume}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Market Cap</p>
                        <p className="text-sm font-medium text-gray-900">{stock.marketCap}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                )}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Watchlist;
