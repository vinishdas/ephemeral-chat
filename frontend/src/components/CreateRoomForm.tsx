import { useState } from "react";
import { useWebSocket } from "../hooks/useWebSocket";

interface Props {
  onRoomCreated: (room: { roomCode: string; roomName: string; expiresAt: number }) => void;
}

export default function CreateRoomForm({ onRoomCreated }: Props) {
  const { send, onMessage } = useWebSocket(import.meta.env.VITE_WS_URL);
  const [roomName, setRoomName] = useState("");
  const [nickname, setNickname] = useState("");
  const [duration, setDuration] = useState(15);

  onMessage((msg) => {
    if (msg.type === "room_created") {
      onRoomCreated(msg.payload);
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    send("create_room", { roomName, nickname, duration });
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
      <input
        placeholder="Your nickname"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        className="border p-2 rounded"
        required
      />
      <input
        type="number"
        value={duration}
        onChange={(e) => setDuration(Number(e.target.value))}
        min={1}
        className="border p-2 rounded"
      />
      <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
        Create Room
      </button>
    </form>
  );
}
