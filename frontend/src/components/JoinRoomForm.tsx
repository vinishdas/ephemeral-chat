import { useState } from "react";
import { useWebSocket } from "../hooks/useWebSocket";

interface Props {
  onJoinedRoom: (room: { roomName: string; expiresAt: number; roomCode: string }) => void;
}

export default function JoinRoomForm({ onJoinedRoom }: Props) {
  const { send, onMessage } = useWebSocket(import.meta.env.VITE_WS_URL);
  const [roomCode, setRoomCode] = useState("");
  const [nickname, setNickname] = useState("");

  onMessage((msg) => {
    if (msg.type === "joined_room") {
      onJoinedRoom({ ...msg.payload, roomCode });
    }
  });

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    send("join_room", { roomCode, nickname });
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
      <input
        placeholder="Your Nickname"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        className="border p-2 rounded"
        required
      />
      <button type="submit" className="bg-green-600 text-white p-2 rounded hover:bg-green-700">
        Join Room
      </button>
    </form>
  );
}
