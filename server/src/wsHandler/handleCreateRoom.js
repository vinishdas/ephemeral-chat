import { generateCode } from "../utils/generateCode.js";
import { rooms } from "../utils/roomStore.js";

export function handleCreateRoom(ws, payload) {
  const { roomName, duration, nickname } = payload;
  const roomCode = generateCode();
  const expiresAt = Date.now() + duration * 60 * 1000;

  rooms.set(roomCode, {
    name: roomName,
    expiresAt,
    users: new Set([ws]),
    meta: new Map([[ws, nickname]])
  });

  ws.send(JSON.stringify({
    type: "room_created",
    payload: { roomCode, expiresAt, roomName }
  }));

  setTimeout(() => {
    rooms.delete(roomCode);
    ws.send(JSON.stringify({
      type: "room_expired",
      payload: { roomCode }
    }));
  }, duration * 60 * 1000);
}
