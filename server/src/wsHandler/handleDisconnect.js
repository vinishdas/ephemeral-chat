import { rooms } from "../utils/roomStore.js";
import { wsRoomMap } from "../index.js";

// Add connectionId to parameters
export function handleDisconnect(ws, connectionId) {
  console.log(`[Conn ${connectionId}] Handling disconnect.`); // Log entry
  const roomCode = wsRoomMap.get(ws);
  if (!roomCode) {
    console.log(`[Conn ${connectionId}] User was not mapped to a room.`);
    return; // User wasn't in a room or already cleaned up
  }

  const room = rooms.get(roomCode);
  if (!room) {
    console.log(`[Conn ${connectionId}] Room ${roomCode} not found (already expired or deleted?).`);
    wsRoomMap.delete(ws); // Clean up map anyway
    return;
  }

  const userData = room.meta.get(ws);

  // Log removal attempt
  console.log(`[Conn ${connectionId}] Removing user ${userData ? userData.nickname : 'Unknown Nickname'} from room ${roomCode}.`);
  const deletedFromUsers = room.users.delete(ws);
  const deletedFromMeta = room.meta.delete(ws);
  const deletedFromMap = wsRoomMap.delete(ws);
  console.log(`[Conn ${connectionId}] Removal results - users:${deletedFromUsers}, meta:${deletedFromMeta}, map:${deletedFromMap}.`);


  if (userData) {
    // Notify remaining users
    console.log(`[Conn ${connectionId}] Notifying ${room.users.size} remaining users in room ${roomCode} about ${userData.nickname} leaving.`);
    room.users.forEach(u => {
      // Avoid trying to send to the disconnected socket
      if (u !== ws && u.readyState === WebSocket.OPEN) { // Check readyState
           u.send(JSON.stringify({
            type: "user_left",
            roomCode: roomCode,
            payload: { nickname: userData.nickname }
          }));
      }
    });
  }

  // Optional: If room is now empty, delete it immediately
  if (room.users.size === 0) {
     rooms.delete(roomCode);
     console.log(`[Conn ${connectionId}] Room ${roomCode} is now empty, deleting.`);
  }
}

// Add WebSocket import if not already present for readyState check
import { WebSocket } from 'ws';