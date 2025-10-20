// src/components/CreateRoomForm.tsx
import { useState, useEffect } from "react";
import { useAppContext } from "../AppContext";
import { generateAesKey } from "../utils/crypto";
import type { RoomState, Participant } from "../types/types";

interface Props {
  onRoomCreated: (room: RoomState, nickname: string) => void;
}

export default function CreateRoomForm({ onRoomCreated }: Props) {
  const { send, onMessage, userPublicKeyJwk, userKeyPair, username } = useAppContext();
  const [roomName, setRoomName] = useState("");
  const [duration, setDuration] = useState(15);

  useEffect(() => {
    // Directly return the cleanup function from onMessage
    return onMessage(async (msg) => {
      if (msg.type === "room_created") {
        const { roomCode, expiresAt, roomName } = msg.payload;
        
        const roomSecret = await generateAesKey();

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
            text: "Room created. Share the code to invite others.",
            isSystem: true 
          }],
          roomSecret,
          selfNickname: username,
        };
        
        onRoomCreated(newRoom, username);
      }
    });
  }, [onMessage, onRoomCreated, username, userKeyPair, userPublicKeyJwk]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim() || !username.trim() || !userPublicKeyJwk) {
      if (!username.trim()) {
        alert("Please set your username first.");
      }
      return;
    }

    send("create_room", {
      roomName,
      nickname: username,
      duration,
      publicKeyJwk: userPublicKeyJwk,
    });
  };

  return (
    <form onSubmit={handleCreate} className="p-4 flex flex-col gap-3 border rounded-xl bg-white shadow">
      <h2 className="text-lg font-bold">Create Room</h2>
      <input
        placeholder="Room name"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        className="border p-2 rounded"
        required
      />
      <select
        value={duration}
        onChange={(e) => setDuration(Number(e.target.value))}
        className="border p-2 rounded"
      >
        <option value={15}>15 Minutes</option>
        <option value={60}>1 Hour</option>
        <option value={1440}>24 Hours</option>
      </select>
      <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
        Create Room
      </button>
    </form>
  );
}