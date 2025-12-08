import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { wsService } from './services/websocket'

// ✅ FORCE ENV INJECTION CHECK (IMPORTANT)
console.log("BUILD_TIME_API_URL:", import.meta.env.VITE_API_URL);

// ✅ GLOBAL websocket – runs ONCE only
wsService.connect();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
