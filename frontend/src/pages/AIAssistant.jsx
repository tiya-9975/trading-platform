import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Bot, Send, Volume2, RefreshCw } from 'lucide-react';
import { aiAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AIAssistant = () => {
  const { user, updateUser } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your AI trading assistant powered by DeepSeek AI. I can check stock prices, place buy orders, show your portfolio, and give recommendations. Try saying "Buy 5 shares of Apple" or "What\'s the price of Tesla?"' }
  ]);
  const [inputText, setInputText] = useState('');
  const [processing, setProcessing] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        const speechToText = event.results[0][0].transcript;
        setTranscript(speechToText);
        handleCommand(speechToText);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleCommand = async (command) => {
    setMessages(prev => [...prev, { role: 'user', content: command }]);
    setProcessing(true);

    try {
      const response = await aiAPI.processChat(command);
      const aiResponse = response.data.response;
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: aiResponse,
        action: response.data.action,
        type: response.data.type
      }]);
      
      // Update balance if it changed
      if (response.data.newBalance !== undefined) {
        updateUser({ ...user, balance: response.data.newBalance });
      }
      
      // Text-to-speech response
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(aiResponse);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your request. Please try again.' 
      }]);
    } finally {
      setProcessing(false);
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      handleCommand(inputText);
      setInputText('');
    }
  };

  const speakMessage = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const exampleCommands = [
    "What's the price of Apple?",
    "Buy 5 shares of Tesla",
    "Show me my portfolio",
    "Give me recommendations"
  ];

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
          <Bot size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-100">AI Assistant</h1>
          <p className="text-sm text-gray-400">Powered by DeepSeek AI - Voice & Text</p>
        </div>
      </div>

      <div className="flex-1 bg-gray-900 rounded-xl shadow-sm border border-gray-700 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-white" />
                </div>
              )}
              
              <div className={`max-w-2xl ${message.role === 'user' ? 'order-first' : ''}`}>
                <div className={`rounded-xl p-4 ${
                  message.role === 'user' 
                    ? 'bg-primary-600 text-white ml-auto' 
                    : 'bg-gray-800 text-gray-100 border border-gray-700'
                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  
                  {/* Action badge */}
                  {message.action && (
                    <div className="mt-2 pt-2 border-t border-gray-600">
                      <span className="text-xs px-2 py-1 bg-green-900/30 text-green-400 rounded">
                        {message.action === 'buy_stock' && '✓ Order Executed'}
                        {message.action === 'get_stock_price' && 'ℹ️ Price Info'}
                        {message.action === 'get_portfolio' && '📊 Portfolio'}
                        {message.action === 'get_recommendations' && '💡 Recommendations'}
                      </span>
                    </div>
                  )}
                </div>
                
                {message.role === 'assistant' && (
                  <button
                    onClick={() => speakMessage(message.content)}
                    className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-primary-400"
                  >
                    <Volume2 size={14} />
                    Speak
                  </button>
                )}
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 bg-primary-900/30 border border-primary-700/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-400 font-semibold text-sm">You</span>
                </div>
              )}
            </div>
          ))}

          {processing && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-700 p-4 bg-gray-900">
          {isListening && (
            <div className="mb-4 bg-red-900/20 border border-red-700/30 rounded-lg p-3">
              <p className="text-sm text-red-400 flex items-center gap-2">
                <span className="animate-pulse">🔴</span>
                Listening... Speak now
              </p>
              {transcript && <p className="text-sm text-gray-300 mt-1">{transcript}</p>}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={toggleListening}
              disabled={processing}
              className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              } disabled:bg-gray-600 disabled:cursor-not-allowed`}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            <form onSubmit={handleTextSubmit} className="flex-1 flex gap-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a command or use voice..."
                disabled={processing || isListening}
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 text-gray-100 placeholder-gray-400"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || processing || isListening}
                className="flex-shrink-0 w-12 h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center justify-center transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Example Commands */}
      <div className="mt-4 bg-gray-900 border border-gray-700 rounded-xl p-4">
        <p className="text-sm font-medium text-gray-300 mb-3">Try these commands:</p>
        <div className="flex flex-wrap gap-2">
          {exampleCommands.map((cmd, index) => (
            <button
              key={index}
              onClick={() => handleCommand(cmd)}
              disabled={processing || isListening}
              className="text-xs px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:border-primary-500 hover:bg-primary-900/20 transition-colors disabled:opacity-50 text-gray-300"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;