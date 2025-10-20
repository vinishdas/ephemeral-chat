import { rooms } from "../utils/roomStore.js";
import { wsRoomMap } from "../index.js";
// Make sure WebSocket is imported if you use readyState checks later
import { WebSocket } from 'ws';

// Ensure connectionId is accepted as the third argument
export function handleJoinRoom(ws, payload, connectionId) {
  const { roomCode, nickname, publicKeyJwk } = payload;

  // *** FIX: Use connectionId in the log statement ***
  console.log(`[Conn ${connectionId}] Handling join_room for room ${roomCode}, nickname ${nickname}`);

  if (!roomCode || !nickname || !publicKeyJwk) {
     console.error(`[Conn ${connectionId}] Join attempt failed: Missing fields.`);
     // It's good practice to send an error back to the client
     if (ws.readyState === WebSocket.OPEN) {
       ws.send(JSON.stringify({ type: "error", payload: "Missing fields for joining room." }));
     }
     return; // Stop execution
  }

  const room = rooms.get(roomCode);
  if (!room) {
    console.error(`[Conn ${connectionId}] Join attempt failed: Room ${roomCode} not found.`);
     if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "error", payload: "Room not found" }));
     }
    return;
  }

  if (room.expiresAt < Date.now()) {
     console.error(`[Conn ${connectionId}] Join attempt failed: Room ${roomCode} has expired.`);
     if (ws.readyState === WebSocket.OPEN) {
       ws.send(JSON.stringify({ type: "error", payload: "Room has expired" }));
     }
     return;
  }

  // --- Key Exchange Logic ---

  const existingParticipants = [];
  room.meta.forEach((data, userWs) => {
    // Make sure the participant's socket is still open before adding
    if (userWs.readyState === WebSocket.OPEN) {
        existingParticipants.push(data);
    } else {
        // Optional: Clean up stale entries if found, though handleDisconnect should cover this
        console.warn(`[Conn ${connectionId}] Found stale participant ${data.nickname} in room ${roomCode} during join.`);
    }
  });

  // Add new user FIRST (simplifies logic compared to previous version)
  console.log(`[Conn ${connectionId}] Adding user ${nickname} to room ${roomCode}.`);
  room.users.add(ws);
  room.meta.set(ws, { nickname, publicKeyJwk });
  wsRoomMap.set(ws, roomCode);
  console.log(`[Conn ${connectionId}] User ${nickname} added successfully to room ${roomCode}.`);


  // Send "joined" confirmation to the new user (User B)
  if (ws.readyState === WebSocket.OPEN) {
      console.log(`[Conn ${connectionId}] Sending joined_room confirmation to ${nickname}.`);
      ws.send(JSON.stringify({
        type: "joined_room",
        payload: { roomName: room.name, expiresAt: room.expiresAt, roomCode: roomCode }
      }));

      // Send the list of existing users to the *new* user (User B)
      console.log(`[Conn ${connectionId}] Sending existing_participants list (${existingParticipants.length} users) to ${nickname}.`);
      ws.send(JSON.stringify({
        type: "existing_participants",
        roomCode: roomCode,
        payload: existingParticipants
      }));
  } else {
      console.warn(`[Conn ${connectionId}] User ${nickname} disconnected before join confirmation could be sent.`);
      // If they disconnected here, handleDisconnect should clean them up.
      return; // Stop processing for this user
  }


  // Notify existing users (User A) about the *new* user (User B)
  console.log(`[Conn ${connectionId}] Notifying ${existingParticipants.length} existing users about ${nickname} joining.`);
  room.users.forEach(u => {
    // Don't send to self, and ensure recipient is still connected
    if (u !== ws && u.readyState === WebSocket.OPEN) {
      const recipientData = room.meta.get(u); // Get recipient nickname for logging
      const recipientNickname = recipientData ? recipientData.nickname : 'Unknown';
      console.log(`[Conn ${connectionId}] Sending user_joined notification about ${nickname} to ${recipientNickname}.`);
      u.send(JSON.stringify({
        type: "user_joined",
        roomCode: roomCode,
        payload: { nickname, publicKeyJwk } // Send new user's info
      }));
    }
  });
  console.log(`[Conn ${connectionId}] Finished handling join_room for ${nickname}.`);
}