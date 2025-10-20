// src/components/RoomDashboard.tsx
import type { RoomState } from "../types/types";
import ChatRoom from "./ChatRoom";
import RoomTabs from "./RoomTabs";

interface Props {
  rooms: Map<string, RoomState>;
  activeRoomCode: string | null;
  setActiveRoomCode: (code: string) => void;
  sendMessage: (message: string) => void;
}

export default function RoomDashboard({
  rooms,
  activeRoomCode,
  setActiveRoomCode,
  sendMessage,
}: Props) {
  const activeRoomState = activeRoomCode ? rooms.get(activeRoomCode) : null;

  return (
    // Main flex container: column on mobile, row on desktop. Ensure it grows.
    <div className="flex-1 flex flex-col md:flex-row min-h-0"> {/* Added min-h-0 for flex children */}
      {/* --- Left Panel: Room List --- */}
      {/* Defined height/width, allow shrinking */}
      <div className="w-full md:w-1/3 lg:w-1/4 h-[35%] md:h-full flex flex-col border-b md:border-b-0 md:border-r border-zinc-700 bg-zinc-900 shrink-0">
        <div className="p-4 border-b border-zinc-700 shrink-0"> {/* Prevent header shrinking */}
          <h2 className="text-lg font-bold text-zinc-100">Active Rooms</h2>
        </div>
        {/* Scrollable area */}
        <div className="flex-1 p-3 overflow-y-auto min-h-0"> {/* Added min-h-0 */}
          <RoomTabs
            rooms={Array.from(rooms.values())}
            activeRoomCode={activeRoomCode}
            onSelectRoom={setActiveRoomCode}
          />
        </div>
      </div>

      {/* --- Right Panel: Active Chat --- */}
      {/* Ensure this panel grows and handles overflow */}
      <div className="flex-1 w-full md:w-2/3 lg:w-3/4 flex flex-col bg-zinc-800/30 min-h-0 min-w-0"> {/* Added min-h-0, min-w-0 */}
        {activeRoomState ? (
          <ChatRoom
            key={activeRoomState.roomCode}
            roomState={activeRoomState}
            onSendMessage={sendMessage}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 p-6 text-center">
            <span className="text-xl font-medium mb-2">
              {rooms.size > 0 ? "Select a Room" : "No Active Rooms"}
            </span>
            <span className="text-sm">
              {rooms.size > 0
                ? "Choose a room from the list to start chatting."
                : "Go back to the lobby to create or join one."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}