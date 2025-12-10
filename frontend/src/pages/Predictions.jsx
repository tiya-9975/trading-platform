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
            <h1 className="text-2xl font-bold text-blue-600">AI Predictions</h1>
            <p className="text-sm text-gray-600">Smart insights powered by DeepSeek AI</p>
          </div>
        </div>
      </div>

      {/* AI Recommendations Card */}
      {recommendations && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-400 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Top Recommendations</h2>
            </div>
            
            <button
              onClick={speakRecommendations}
              disabled={speaking}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Volume2 size={18} />
              {speaking ? 'Speaking...' : 'Read Aloud'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {recommendations.topPicks.map((pick, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="font-semibold text-gray-900">{pick.symbol}</p>
                <p className="text-xs text-gray-600 mb-2">{pick.name}</p>
                <p className="text-sm text-gray-800 mb-3">{pick.reason}</p>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-600">Current Price</p>
                  <p className="text-lg font-bold text-gray-900">${pick.price}</p>
                  <p className={`text-xs ${pick.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {pick.change >= 0 ? '+' : ''}{pick.change}% today
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg p-4">
            <p className="text-xs font-medium text-gray-900 mb-2">Key Suggestions:</p>
            <ul className="space-y-1">
              {recommendations.suggestions.map((suggestion, idx) => (
                <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                  <span className="text-purple-600">•</span>
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
            className="bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-400 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <Link to={`/stock/${prediction.symbol}`} className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{prediction.symbol}</h3>
                <p className="text-sm text-gray-600">{prediction.name}</p>
              </Link>
              
              <div className="flex gap-2">
                <button
                  onClick={() => speakPrediction(prediction)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Read prediction aloud"
                >
                  <Volume2 size={18} className="text-gray-600 hover:text-purple-600" />
                </button>
                <span className="text-3xl">{prediction.icon}</span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Current Price</p>
              <p className="text-2xl font-bold text-gray-900">${prediction.currentPrice}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-gray-900 mb-2">{prediction.prediction}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-700">Confidence: {prediction.confidence}%</span>
                <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                    style={{ width: `${prediction.confidence}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div>
                <p className="text-xs text-gray-600">Target Price</p>
                <p className="text-lg font-bold text-gray-900">${prediction.targetPrice}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">Timeframe</p>
                <p className="text-sm font-medium text-gray-800">{prediction.timeframe}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-400 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <TrendingUp size={24} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">About AI Predictions</h3>
            <p className="text-sm text-gray-800 leading-relaxed">
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