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

  // ... (useEffect and handleJoin logic remain the same) ...
  useEffect(() => {
    const upperCaseRoomCode = roomCode.toUpperCase();
    return onMessage((msg) => {
      if (msg.type === "joined_room" && msg.payload.roomCode === upperCaseRoomCode) {
        const { roomName, expiresAt } = msg.payload;
        const self: Participant = { nickname: username, publicKey: userKeyPair!.publicKey, publicKeyJwk: userPublicKeyJwk!, };
        const newRoom: RoomState = { roomCode: upperCaseRoomCode, roomName, expiresAt, participants: new Map([[username, self]]), messages: [{ id: crypto.randomUUID(), sender: "System", text: `Joined room ${roomName}. Waiting for key exchange...`, isSystem: true }], roomSecret: null, selfNickname: username, };
        onRoomJoined(newRoom, username);
      }
    });
   }, [onMessage, onRoomJoined, username, roomCode, userKeyPair, userPublicKeyJwk]);

   const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim() || !username.trim() || !userPublicKeyJwk) {
       if (!username.trim()) { alert("Please set your username first."); }
       return;
    }
    send("join_room", { roomCode: roomCode.toUpperCase(), nickname: username, publicKeyJwk: userPublicKeyJwk });
   };

  return (
    // Card-like styling for dark mode with backdrop blur
    <form onSubmit={handleJoin} className="p-6 flex flex-col gap-4 border border-zinc-700 rounded-xl bg-zinc-900/80 backdrop-blur-sm shadow-lg">
      <h2 className="text-xl font-bold text-center text-[--color-primary-400]">Join Existing Room</h2>
      {/* Room Code Input */}
       <div>
        <label htmlFor="join-room-code" className="block text-sm font-medium text-zinc-400 mb-1">Room Code</label>
        <input
            id="join-room-code"
            placeholder="ABCDEF"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            // Darker input + specific styles for room code
            className="w-full bg-zinc-700 border-zinc-600 focus:border-[--color-primary-500] focus:ring-[--color-primary-500] font-mono tracking-widest text-lg text-center"
            required
            maxLength={6}
            autoCapitalize="characters"
          />
       </div>
      {/* Submit Button */}
      <button
        type="submit"
        // Secondary button style for dark mode
        className="w-full mt-2 bg-zinc-700 text-zinc-200 hover:bg-zinc-600/80 focus:ring-zinc-500"
        disabled={!username.trim()}
      >
        Join Room 🚪
      </button>
    </form>
  );
}