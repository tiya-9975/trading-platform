// frontend/src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { stocksAPI, portfolioAPI, aiAPI } from "../services/api";
import { wsService } from "../services/websocket";

const Dashboard = () => {
  const [stocks, setStocks] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔔 Stores currently triggered alert for red banner
  const [triggeredAlert, setTriggeredAlert] = useState(null);

  useEffect(() => {
    loadData();

    // Connect WS + subscribe
    wsService.connect();
    wsService.addListener(handleWS);

    return () => {
      wsService.removeListener(handleWS);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      const [stocksRes, portfolioRes, recsRes] = await Promise.all([
        stocksAPI.getAll(),
        portfolioAPI.getSummary(),
        aiAPI.getRecommendations(),
      ]);

      setStocks(stocksRes.data.slice(0, 6));
      setPortfolio(portfolioRes.data);
      setRecommendations(recsRes.data);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWS = (data) => {
    // 📈 Live price updates
    if (data.type === "price_update") {
      setStocks((prev) =>
        prev.map((stock) => ({
          ...stock,
          ...(data.data[stock.symbol] || {}),
        }))
      );
    }

    // 🔔 RED BANNER ALERT
    if (data.type === "alert_triggered") {
      console.log("🚨 DASHBOARD RECEIVED ALERT:", data.alert);

      setTriggeredAlert(data.alert);

      // Hide after 5 seconds
      setTimeout(() => setTriggeredAlert(null), 5000);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
          <p className="mt-4 text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 🔔 ALERT BANNER */}
      {triggeredAlert && (
        <div className="alert-banner bg-red-600 text-white px-6 py-4 rounded-xl shadow-lg">
          <p className="font-bold text-lg">🔔 Price Alert Triggered</p>
          <p className="mt-1">
            {triggeredAlert.symbol} hit ${triggeredAlert.targetPrice} (
            {triggeredAlert.condition})
          </p>
        </div>
      )}

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Value</p>
          <p className="text-2xl font-bold text-gray-900">
            ${portfolio?.summary?.accountValue || "0"}
          </p>
          <p className="text-xs text-green-600 mt-2">+2.4% this month</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total P/L</p>
          <p
            className={`text-2xl font-bold ${
              parseFloat(portfolio?.summary?.totalProfitLoss) >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            ${portfolio?.summary?.totalProfitLoss || "0"}
          </p>
          <p
            className={`text-xs mt-2 ${
              parseFloat(portfolio?.summary?.totalProfitLossPercent) >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {portfolio?.summary?.totalProfitLossPercent}%
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Holdings</p>
          <p className="text-2xl font-bold text-gray-900">
            {portfolio?.holdings?.length || 0}
          </p>
          <p className="text-xs text-gray-500 mt-2">Active positions</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Cash</p>
          <p className="text-2xl font-bold text-gray-900">
            ${portfolio?.summary?.cash || "0"}
          </p>
          <p className="text-xs text-gray-500 mt-2">Available</p>
        </div>
      </div>

      {/* Market Movers */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Market Movers
          </h2>
          {/* <Link
            to="/stocks"
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            View All <ArrowRight size={16} />
          </Link> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stocks.map((stock) => (
            <Link
              key={stock.symbol}
              to={`/stock/${stock.symbol}`}
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{stock.symbol}</p>
                  <p className="text-xs text-gray-500">{stock.name}</p>
                </div>
                {stock.changePercent >= 0 ? (
                  <TrendingUp size={20} className="text-green-600" />
                ) : (
                  <TrendingDown size={20} className="text-red-600" />
                )}
              </div>

              <div className="flex items-end justify-between mt-3">
                <p className="text-xl font-bold text-gray-900">
                  ${stock.price}
                </p>
                <p
                  className={`text-sm font-medium ${
                    stock.changePercent >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {stock.changePercent >= 0 ? "+" : ""}
                  {stock.changePercent}%
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* AI Recommendations */}
      {recommendations && (
        <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl p-6 shadow-sm border border-primary-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              {/* <span className="text-white font-bold text-sm">AI</span> */}
            </div>
            <h2 className="text-lg font-semibold bg-blue-600 text-white px-3 py-1 rounded">
  AI Recommendations
</h2>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.topPicks.map((pick, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4">
                <p className="font-semibold text-gray-900">{pick.symbol}</p>
                <p className="text-xs text-gray-500 mb-2">{pick.name}</p>
                <p className="text-sm text-gray-600">{pick.reason}</p>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Current Price</p>
                  <p className="text-lg font-bold text-gray-900">
                    ${pick.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
