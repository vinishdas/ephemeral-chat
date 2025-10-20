// src/index.js
import express from "express";
import { WebSocketServer, WebSocket } from "ws"; // Import WebSocket for type checking if using TS/JSDoc
import { handleCreateRoom } from "./wsHandler/handleCreateRoom.js";
import { handleJoinRoom } from "./wsHandler/handleJoinRoom.js";
import { handleMessageRelay } from "./wsHandler/handleMessageRelay.js";
import { handleKeyShare } from "./wsHandler/handleKeyShare.js";
import { handleDisconnect } from "./wsHandler/handleDisconnect.js";

// --- Add a unique ID to each connection for easier tracking ---
let connectionIdCounter = 0;
const wsConnections = new Map(); // Map<WebSocket, number>
// --- End ID addition ---

const app = express();
const port = process.env.PORT || 8080;

const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

const wss = new WebSocketServer({ server });

export const wsRoomMap = new Map(); // Map<WebSocket, string> roomCode

wss.on("connection", (ws) => {
  // --- Assign and log connection ID ---
  const connectionId = ++connectionIdCounter;
  wsConnections.set(ws, connectionId);
  console.log(`[Conn ${connectionId}] WebSocket connected.`);
  // --- End ID log ---

  ws.on("message", (msg) => {
    try {
      // Log received message type
      const messageData = JSON.parse(msg.toString());
      console.log(`[Conn ${connectionId}] Received message type: ${messageData.type}`);
      // --- End Log ---

      const { type, payload } = messageData; // Use parsed data

      switch (type) {
        case "create_room":
          handleCreateRoom(ws, payload, connectionId); // Pass ID for logging
          break;
        case "join_room":
          handleJoinRoom(ws, payload, connectionId); // Pass ID for logging
          break;
        case "chat_message":
          handleMessageRelay(ws, payload, connectionId); // Pass ID for logging
          break;
        case "share_key":
          handleKeyShare(ws, payload, connectionId); // Pass ID for logging
          break;
        default:
          console.warn(`[Conn ${connectionId}] Unknown message type:`, type);
      }
    } catch (e) {
      console.error(`[Conn ${connectionId}] Failed to parse message or handle:`, msg.toString(), e);
    }
  });

  ws.on("close", (code, reason) => {
    // --- Log disconnection ---
    const closedConnectionId = wsConnections.get(ws) || 'Unknown';
    console.log(`[Conn ${closedConnectionId}] WebSocket disconnected. Code: ${code}, Reason: ${reason ? reason.toString() : 'No reason'}`);
    handleDisconnect(ws, closedConnectionId); // Pass ID for logging
    wsConnections.delete(ws); // Clean up ID map
     // --- End Log ---
  });

  ws.on("error", (err) => {
     // --- Log error and trigger disconnect ---
     const errorConnectionId = wsConnections.get(ws) || 'Unknown';
     console.warn(`[Conn ${errorConnectionId}] WebSocket error:`, err);
     // Ensure disconnect logic runs even on error
     handleDisconnect(ws, errorConnectionId);
     wsConnections.delete(ws);
     // --- End Log ---
  });
});