// src/components/RoomTabs.tsx
import type { RoomState } from "../types/types";

interface Props {
  rooms: RoomState[];
  activeRoomCode: string | null;
  onSelectRoom: (roomCode: string) => void;
}

export default function RoomTabs({ rooms, activeRoomCode, onSelectRoom }: Props) {
  if (rooms.length === 0) {
    return <div className="text-sm text-zinc-500 text-center p-4">No active rooms.</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      {rooms.map((r) => (
        <button
          key={r.roomCode}
          type="button"
          // Conditional styling for active/inactive tabs
          className={`
            w-full p-3 rounded-lg border text-left transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-[--color-primary-500]
            ${
              r.roomCode === activeRoomCode
                ? 'bg-gradient-to-r from-[--color-primary-700]/50 to-[--color-primary-800]/50 border-[--color-primary-600] text-zinc-50 shadow-md' // Active: Purple gradient/border
                : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700/60 hover:border-zinc-600' // Inactive: Darker gray
            }
          `}
          onClick={() => onSelectRoom(r.roomCode)}
        >
          <div className="font-semibold text-base truncate">{r.roomName}</div> {/* Truncate long names */}
          <div className={`text-xs font-mono mt-0.5 ${r.roomCode === activeRoomCode ? 'text-[--color-primary-300]' : 'text-zinc-500'}`}>
            {r.roomCode}
          </div>
        </button>
      ))}
    </div>
  );
}