const WS_URL =
  import.meta.env.VITE_WS_URL && import.meta.env.VITE_WS_URL.startsWith("ws")
    ? import.meta.env.VITE_WS_URL
    : "ws://localhost:5000";

class WebSocketService {
  constructor() {
    this.ws = null;
    this.listeners = new Set();
    this.reconnectInterval = 2000;
    this.reconnectTimer = null;
  }

  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log("⚠️ WS already connected");
      return;
    }

    console.log("🌐 Connecting WebSocket →", WS_URL);

    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log("✅ WS CONNECTED");
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
      };

      this.ws.onmessage = (event) => {
        console.log("📨 WS MESSAGE RAW →", event.data);

        try {
          const data = JSON.parse(event.data);
          console.log("📨 WS MESSAGE PARSED →", data);

          // notify Dashboard.jsx listeners
          this.listeners.forEach((cb) => cb(data));
        } catch (err) {
          console.error("❌ WS JSON parse error", err);
        }
      };

      this.ws.onerror = (err) => {
        console.log("❌ WS ERROR →", err);
      };

      this.ws.onclose = () => {
        console.log("🔌 WS CLOSED");
        this.reconnect();
      };
    } catch (err) {
      console.log("🔥 WS CONNECT EXCEPTION →", err);
      this.reconnect();
    }
  }

  reconnect() {
    if (this.reconnectTimer) return;

    this.reconnectTimer = setTimeout(() => {
      console.log("🔄 WS RECONNECTING…");
      this.connect();
    }, this.reconnectInterval);
  }

  addListener(cb) {
    console.log("👂 Adding WS listener:", cb.name || "anonymous");
    this.listeners.add(cb);
  }

  removeListener(cb) {
    console.log("🗑 Removing WS listener:", cb.name || "anonymous");
    this.listeners.delete(cb);
  }
}

export const wsService = new WebSocketService();
export default wsService;
