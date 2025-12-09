import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://trading-platform-api-2oay.onrender.com/api';

// Optional: Log for debugging (remove in production)
console.log('🔍 API_URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Stocks
export const stocksAPI = {
  getAll: () => api.get('/stocks'),
  getBySymbol: (symbol) => api.get(`/stocks/${symbol}`),
  getHistory: (symbol, days = 30) => api.get(`/stocks/${symbol}/history?days=${days}`),
  search: (query) => api.get(`/stocks/search?q=${query}`),
};

// Portfolio
export const portfolioAPI = {
  get: () => api.get('/portfolio'),
  getSummary: () => api.get('/portfolio/summary'),
  buy: (data) => api.post('/portfolio/buy', data),
  sell: (data) => api.post('/portfolio/sell', data),
};

// Watchlist
export const watchlistAPI = {
  get: () => api.get('/watchlist'),
  add: (data) => api.post('/watchlist', data),
  remove: (symbol) => api.delete(`/watchlist/${symbol}`),
  check: (symbol) => api.get(`/watchlist/check/${symbol}`),
};

// Alerts
export const alertsAPI = {
  get: () => api.get('/alerts'),
  create: (data) => api.post('/alerts', data),
  update: (id, data) => api.patch(`/alerts/${id}`, data),
  delete: (id) => api.delete(`/alerts/${id}`),
  getCount: () => api.get('/alerts/count'),
};

// AI
export const aiAPI = {
  getPrediction: (symbol) => api.get(`/ai/predict/${symbol}`),
  getRecommendations: () => api.get('/ai/recommendations'),
  getNews: (symbol) => api.get(`/ai/news/${symbol}`),
  getPortfolioAdvice: () => api.get('/ai/portfolio-advice'),
  processChat: (message) => api.post('/ai/chat', { message }),
  getBatchPredictions: (symbols) => api.post('/ai/predictions/batch', { symbols }),
};

export default api;