import express from "express";
import { WebSocketServer } from "ws";
import { handleCreateRoom } from "./wsHandler/handleCreateRoom.js";
import { handleJoinRoom } from "./wsHandler/handleJoinRoom.js";
import { handleMessageRelay } from "./wsHandler/handleMessageRelay.js";

const app = express();
const port = process.env.PORT || 8080;

const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  ws.on("message", (msg) => {
    const { type, payload } = JSON.parse(msg.toString());
    switch (type) {
      case "create_room":
        handleCreateRoom(ws, payload);
        break;
      case "join_room":
        handleJoinRoom(ws, payload);
        break;
      case "chat_message":
        handleMessageRelay(ws, payload);
        break;
      default:
        console.warn("Unknown message type:", type);
    }
  });
});