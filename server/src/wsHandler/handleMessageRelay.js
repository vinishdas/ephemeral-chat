// src/wsHandler/handleMessageRelay.js
import { rooms } from "../utils/roomStore.js";

export function handleMessageRelay(ws, payload) {
  const { roomCode, encryptedMessage } = payload;
  const room = rooms.get(roomCode);
  if (!room) return;
  
  const sender = room.meta.get(ws);
  if (!sender) return;

  room.users.forEach(u => {
    if (u !== ws) { // Don't send back to sender
      u.send(JSON.stringify({
        type: "message",
        roomCode: roomCode,
        payload: { 
          nickname: sender.nickname, 
          encryptedMessage: encryptedMessage 
        }
      }));
    }
  });
}