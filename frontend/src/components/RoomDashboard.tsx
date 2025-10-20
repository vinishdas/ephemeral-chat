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
    <div className="flex-1 flex h-full"> {/* Use flex-1 to fill parent */}
      {/* --- Left Panel: Room List --- */}
      <div className="w-1/3 border-r bg-gray-50 rounded-l-xl flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">Your Active Rooms</h1>
        </div>
        
        {/* Forms are now removed from here */}

        <div className="flex-1 p-4 overflow-y-auto">
          <RoomTabs 
            rooms={Array.from(rooms.values())} 
            activeRoomCode={activeRoomCode}
            onSelectRoom={setActiveRoomCode}
          />
        </div>
      </div>

      {/* --- Right Panel: Active Chat --- */}
      <div className="w-2/3 flex flex-col">
        {activeRoomState ? (
          <ChatRoom 
            key={activeRoomState.roomCode}
            roomState={activeRoomState}
            onSendMessage={sendMessage}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            {rooms.size > 0 ? "Select a room to start chatting." : "No active rooms."}
          </div>
        )}
      </div>
    </div>
  );
}