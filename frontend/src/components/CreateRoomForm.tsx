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

  // ... (useEffect and handleCreate logic remain the same) ...
  useEffect(() => {
    return onMessage(async (msg) => {
      if (msg.type === "room_created") {
        const { roomCode, expiresAt, roomName } = msg.payload;
        const roomSecret = await generateAesKey();
        const self: Participant = { nickname: username, publicKey: userKeyPair!.publicKey, publicKeyJwk: userPublicKeyJwk!, };
        const newRoom: RoomState = { roomCode, roomName, expiresAt, participants: new Map([[username, self]]), messages: [{ id: crypto.randomUUID(), sender: "System", text: "Room created. Share the code to invite others.", isSystem: true }], roomSecret, selfNickname: username, };
        onRoomCreated(newRoom, username);
      }
    });
  }, [onMessage, onRoomCreated, username, userKeyPair, userPublicKeyJwk]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim() || !username.trim() || !userPublicKeyJwk) {
      if (!username.trim()) { alert("Please set your username first."); }
      return;
    }
    send("create_room", { roomName, nickname: username, duration, publicKeyJwk: userPublicKeyJwk });
  };


  return (
    // Card-like styling for dark mode with backdrop blur
    <form onSubmit={handleCreate} className="p-6 flex flex-col gap-4 border border-zinc-700 rounded-xl bg-zinc-900/80 backdrop-blur-sm shadow-lg">
      <h2 className="text-xl font-bold text-center text-[--color-primary-400]">Create New Room</h2>
      {/* Room Name Input */}
      <div>
        <label htmlFor="create-room-name" className="block text-sm font-medium text-zinc-400 mb-1">Room Name</label>
        <input
          id="create-room-name"
          placeholder="e.g., Project Meeting"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className="w-full bg-zinc-700 border-zinc-600 focus:border-[--color-primary-500] focus:ring-[--color-primary-500]" // Darker input
          required
        />
      </div>
      {/* Duration Select */}
      <div>
         <label htmlFor="create-duration" className="block text-sm font-medium text-zinc-400 mb-1">Self-destruct Timer</label>
         <select
          id="create-duration"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="w-full bg-zinc-700 border-zinc-600 focus:border-[--color-primary-500] focus:ring-[--color-primary-500]" // Darker select
        >
          <option value={15}>15 Minutes</option>
          <option value={60}>1 Hour</option>
          <option value={1440}>24 Hours</option>
        </select>
      </div>
      {/* Submit Button */}
      <button
        type="submit"
        className="w-full mt-2 shadow shadow-[--color-primary-700]/30" // Base button styles + shadow
        disabled={!username.trim()}
      >
        Create Room ✨
      </button>
    </form>
  );
}