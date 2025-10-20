// src/components/JoinRoomForm.tsx
import { useState, useEffect } from "react";
import { useAppContext } from "../AppContext";
import type { RoomState, Participant } from "../types/types";

interface Props {
  onRoomJoined: (room: RoomState, nickname: string) => void;
}

export default function JoinRoomForm({ onRoomJoined }: Props) {
  const { send, onMessage, userPublicKeyJwk, userKeyPair, username } = useAppContext();
  const [roomCode, setRoomCode] = useState("");

  useEffect(() => {
    // Directly return the cleanup function from onMessage
    return onMessage((msg) => {
      // Note: We only act on the "joined_room" event IF the roomCode
      // matches the one we *just* tried to join.
      if (msg.type === "joined_room" && msg.payload.roomCode === roomCode) {
        
        const { roomName, expiresAt } = msg.payload;

        const self: Participant = {
          nickname: username,
          publicKey: userKeyPair!.publicKey,
          publicKeyJwk: userPublicKeyJwk!,
        };

        const newRoom: RoomState = {
          roomCode,
          roomName,
          expiresAt,
          participants: new Map([[username, self]]),
          messages: [{ 
            id: crypto.randomUUID(), 
            sender: "System", 
            text: `Joined room ${roomName}. Waiting for key exchange...`,
            isSystem: true 
          }],
          roomSecret: null,
          selfNickname: username,
        };

        onRoomJoined(newRoom, username);
      }
    });
  }, [onMessage, onRoomJoined, username, roomCode, userKeyPair, userPublicKeyJwk]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim() || !username.trim() || !userPublicKeyJwk) {
       if (!username.trim()) {
        alert("Please set your username first.");
      }
      return;
    }

    send("join_room", {
      roomCode,
      nickname: username,
      publicKeyJwk: userPublicKeyJwk,
    });
  };

  return (
    <form onSubmit={handleJoin} className="p-4 flex flex-col gap-3 border rounded-xl bg-white shadow">
      <h2 className="text-lg font-bold">Join Room</h2>
      <input
        placeholder="Room Code"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
        className="border p-2 rounded"
        required
      />
      <button type="submit" className="bg-green-600 text-white p-2 rounded hover:bg-green-700">
        Join Room
      </button>
    </form>
  );
}