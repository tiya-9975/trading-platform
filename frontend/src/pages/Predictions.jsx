import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, TrendingUp, Volume2 } from 'lucide-react';
import { aiAPI, stocksAPI } from '../services/api';

const Predictions = () => {
  const [predictions, setPredictions] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    try {
      const [stocksRes, recsRes] = await Promise.all([
        stocksAPI.getAll(),
        aiAPI.getRecommendations()
      ]);
      
      const symbols = stocksRes.data.map(s => s.symbol);
      const predictionsRes = await aiAPI.getBatchPredictions(symbols);
      
      setPredictions(predictionsRes.data);
      setRecommendations(recsRes.data);
    } catch (error) {
      console.error('Failed to load predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const speakRecommendations = () => {
    if (!recommendations || speaking) return;
    
    if ('speechSynthesis' in window) {
      setSpeaking(true);
      window.speechSynthesis.cancel();
      
      const text = `Here are my top stock recommendations: ${
        recommendations.topPicks.map(p => 
          `${p.name} at ${p.price} dollars, ${p.reason}`
        ).join('. ')
      }. ${recommendations.suggestions.join('. ')}`;
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.onend = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const speakPrediction = (prediction) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const text = `${prediction.name}: ${prediction.prediction}. Current price is ${prediction.currentPrice} dollars. Confidence level is ${prediction.confidence} percent. Target price is ${prediction.targetPrice} dollars within ${prediction.timeframe}.`;
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <LineChart size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">AI Predictions</h1>
            <p className="text-sm text-gray-400">Smart insights powered by DeepSeek AI</p>
          </div>
        </div>
      </div>

      {/* AI Recommendations Card */}
      {recommendations && (
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/40 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-100">Top Recommendations</h2>
            </div>
            
            <button
              onClick={speakRecommendations}
              disabled={speaking}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Volume2 size={18} />
              {speaking ? 'Speaking...' : 'Read Aloud'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {recommendations.topPicks.map((pick, idx) => (
              <div key={idx} className="bg-dark-surface border border-dark-border rounded-lg p-4">
                <p className="font-semibold text-gray-100">{pick.symbol}</p>
                <p className="text-xs text-gray-400 mb-2">{pick.name}</p>
                <p className="text-sm text-gray-300 mb-3">{pick.reason}</p>
                <div className="mt-3 pt-3 border-t border-dark-border">
                  <p className="text-xs text-gray-400">Current Price</p>
                  <p className="text-lg font-bold text-gray-100">${pick.price}</p>
                  <p className={`text-xs ${pick.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {pick.change >= 0 ? '+' : ''}{pick.change}% today
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-dark-surface/50 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-300 mb-2">Key Suggestions:</p>
            <ul className="space-y-1">
              {recommendations.suggestions.map((suggestion, idx) => (
                <li key={idx} className="text-xs text-gray-400 flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {predictions.map((prediction) => (
          <div
            key={prediction.symbol}
            className="bg-dark-surface border border-dark-border rounded-xl p-6 hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-900/20 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <Link to={`/stock/${prediction.symbol}`} className="flex-1">
                <h3 className="text-xl font-bold text-gray-100">{prediction.symbol}</h3>
                <p className="text-sm text-gray-400">{prediction.name}</p>
              </Link>
              
              <div className="flex gap-2">
                <button
                  onClick={() => speakPrediction(prediction)}
                  className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
                  title="Read prediction aloud"
                >
                  <Volume2 size={18} className="text-gray-400 hover:text-primary-400" />
                </button>
                <span className="text-3xl">{prediction.icon}</span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-1">Current Price</p>
              <p className="text-2xl font-bold text-gray-100">${prediction.currentPrice}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-gray-100 mb-2">{prediction.prediction}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Confidence: {prediction.confidence}%</span>
                <div className="flex-1 mx-3 bg-dark-border rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                    style={{ width: `${prediction.confidence}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-dark-border">
              <div>
                <p className="text-xs text-gray-400">Target Price</p>
                <p className="text-lg font-bold text-gray-100">${prediction.targetPrice}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Timeframe</p>
                <p className="text-sm font-medium text-gray-300">{prediction.timeframe}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-700/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <TrendingUp size={24} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-100 mb-2">About AI Predictions</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Our AI, powered by DeepSeek, analyzes historical price data, trading volume, market sentiment, and technical indicators 
              to generate predictions. Use the speaker icon to hear predictions read aloud. These are educational insights only and should not be considered as 
              financial advice. Always conduct your own research before making investment decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Predictions;