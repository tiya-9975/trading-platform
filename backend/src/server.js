require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const connectDB = require('./config/db');
const { initWebSocket } = require('./config/websocket');

// Import routes
const authRoutes = require('./routes/auth');
const stocksRoutes = require('./routes/stocks');
const portfolioRoutes = require('./routes/portfolio');
const watchlistRoutes = require('./routes/watchlist');
const alertsRoutes = require('./routes/alerts');
const aiRoutes = require('./routes/ai');

// Initialize express
const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// ----------------------
// ✅ FIXED & PRODUCTION CORS
// ----------------------
const allowedOrigins = [
  "http://localhost:5173",
  "https://trading-platform-two-xi.vercel.app",
  "https://trading-platform-git-main-tiya-jains-projects-31696821.vercel.app" // your real deployed domain
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow Thunder Client / Postman / server-to-server
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.log("❌ CORS blocked:", origin);
        return callback(new Error("Not allowed by CORS"), false);
      }
    },
    credentials: true,
  })
);

// Important for preflight (OPTIONS)
app.options("*", cors());

// ----------------------
// Middlewares
// ----------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ----------------------
// API Routes
// ----------------------
app.use('/api/auth', authRoutes);
app.use('/api/stocks', stocksRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/ai', aiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ----------------------
// Initialize WebSocket
// ----------------------
initWebSocket(server);

// ----------------------
// Start Server
// ----------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║  🚀 Trading Platform API Server Running       ║
║  📡 Port: ${PORT}                              ║
║  🌍 Environment: ${process.env.NODE_ENV || 'development'}              
║  🔌 WebSocket: Enabled                         
╚═══════════════════════════════════════════════╝
  `);
});
