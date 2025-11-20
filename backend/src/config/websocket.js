const WebSocket = require('ws');
const { simulatePriceUpdate } = require('../services/priceSimulator');

let wss;

const initWebSocket = (server) => {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('🔌 New WebSocket connection');

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        console.log('📩 Received:', data);
      } catch (error) {
        console.error('Invalid message format');
      }
    });

    ws.on('close', () => {
      console.log('🔌 WebSocket connection closed');
    });

    ws.send(JSON.stringify({ type: 'connection', message: 'Connected to price feed' }));
  });

  // ⚡ CRITICAL: Broadcast price updates every 3 seconds
  setInterval(() => {
    broadcastPriceUpdate();
  }, 3000);

  console.log('✅ WebSocket server initialized');
};

const broadcastPriceUpdate = () => {
  if (!wss) return;

  const priceUpdate = simulatePriceUpdate();

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'price_update',
        data: priceUpdate,
        timestamp: new Date().toISOString()
      }));
    }
  });
};

module.exports = { initWebSocket };
