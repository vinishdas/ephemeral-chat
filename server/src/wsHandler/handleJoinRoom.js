import { rooms } from "../utils/roomStore.js";

export function handleJoinRoom(ws, payload) {
  const { roomCode, nickname } = payload;
  const room = rooms.get(roomCode);
  if (!room) {
    ws.send(JSON.stringify({ type: "error", payload: "Room not found" }));
    return;
  }

  room.users.add(ws);
  room.meta.set(ws, nickname);

  // Notify existing users
  room.users.forEach(u => {
    u.send(JSON.stringify({
      type: "user_joined",
      payload: { nickname }
    }));
  });

  ws.send(JSON.stringify({
    type: "joined_room",
    payload: { roomName: room.name, expiresAt: room.expiresAt }
  }));
}
