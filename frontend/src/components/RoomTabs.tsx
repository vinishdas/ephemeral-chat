// src/components/RoomTabs.tsx
import type { RoomState } from "../types/types";

interface Props {
  rooms: RoomState[];
  activeRoomCode: string | null;
  onSelectRoom: (roomCode: string) => void;
}

export default function RoomTabs({ rooms, activeRoomCode, onSelectRoom }: Props) {
  if (rooms.length === 0) {
    return <div className="text-sm text-gray-500">No active rooms.</div>;
  }

  // Use a div wrapper for card-like layout
  return (
    <div className="flex flex-col gap-2">
      {rooms.map((r) => (
        // Each item is now a "card"
        <div
          key={r.roomCode}
          className={`cursor-pointer p-3 rounded-lg border ${
            r.roomCode === activeRoomCode
              ? "bg-blue-600 text-white border-blue-700"
              : "bg-white hover:bg-gray-100 border-gray-200"
          }`}
          onClick={() => onSelectRoom(r.roomCode)}
        >
          <div className="font-bold">{r.roomName}</div>
          <div className={`text-sm ${r.roomCode === activeRoomCode ? "opacity-80" : "text-gray-500"}`}>
            {r.roomCode}
          </div>
        </div>
      ))}
    </div>
  );
}