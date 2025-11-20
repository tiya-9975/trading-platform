import { createContext, useEffect } from "react";
import { wsService } from "../services/websocket";

export const WSContext = createContext();

export default function WebSocketProvider({ children }) {
  useEffect(() => {
    console.log("🌐 WebSocketProvider: connecting once...");
    wsService.connect();
  }, []);

  return children;
}
