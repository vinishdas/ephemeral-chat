// src/wsHandler/handleKeyShare.js
import { rooms } from "../utils/roomStore.js";

export function handleKeyShare(ws, payload) {
  const { roomCode, toNickname, encryptedKey } = payload;
  const room = rooms.get(roomCode);
  if (!room) return;

  const senderData = room.meta.get(ws);
  // Ensure we have the sender's data and their public key
  if (!senderData || !senderData.publicKeyJwk) return;

  // Find the target websocket by nickname
  let targetWs = null;
  for (const [userWs, data] of room.meta.entries()) {
    if (data.nickname === toNickname) {
      targetWs = userWs;
      break;
    }
  }

  if (targetWs) {
    targetWs.send(JSON.stringify({
      type: "key_share",
      roomCode: roomCode,
      payload: {
        fromNickname: senderData.nickname,
        fromPublicKeyJwk: senderData.publicKeyJwk, // <-- ADDED THIS
        encryptedKey: encryptedKey
      }
    }));
  }
}