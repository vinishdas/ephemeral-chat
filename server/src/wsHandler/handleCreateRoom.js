// src/wsHandler/handleCreateRoom.js
import { generateCode } from "../utils/generateCode.js";
import { rooms } from "../utils/roomStore.js";
import { wsRoomMap } from "../index.js";

export function handleCreateRoom(ws, payload) {
  const { roomName, duration, nickname, publicKeyJwk } = payload;
  
  if (!roomName || !duration || !nickname || !publicKeyJwk) {
    return ws.send(JSON.stringify({ type: "error", payload: "Missing fields for room creation." }));
  }

  const roomCode = generateCode();
  const expiresAt = Date.now() + duration * 60 * 1000;

  const meta = new Map();
  meta.set(ws, { nickname, publicKeyJwk });

  rooms.set(roomCode, {
    name: roomName,
    expiresAt,
    users: new Set([ws]),
    meta: meta,
  });

  // Map this ws to this room for disconnect handling
  wsRoomMap.set(ws, roomCode);

  ws.send(JSON.stringify({
    type: "room_created",
    payload: { roomCode, expiresAt, roomName }
  }));

  // Set timer to destroy the room
  setTimeout(() => {
    const room = rooms.get(roomCode);
    if (room) {
      room.users.forEach(userWs => {
        userWs.send(JSON.stringify({
          type: "room_expired",
          roomCode: roomCode,
          payload: { message: "Room has expired and been destroyed." }
        }));
        userWs.close();
        wsRoomMap.delete(userWs);
      });
      rooms.delete(roomCode);
      console.log(`Room ${roomCode} expired and was deleted.`);
    }
  }, duration * 60 * 1000);
}