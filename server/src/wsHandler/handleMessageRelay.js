import { rooms } from "../utils/roomStore.js";

export function handleMessageRelay(ws, payload) {
  const { roomCode, message } = payload;
  const room = rooms.get(roomCode);
  if (!room) return;
  const sender = room.meta.get(ws) || "Anonymous";
//   const nickname = room.meta.get(ws);
  room.users.forEach(u => {
    if (u !== ws) {
      u.send(JSON.stringify({
        type: "message",
        payload: { nickname:sender, message }
      }));
    }
  });
}
