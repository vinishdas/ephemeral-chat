// src/pages/ChatDashboardPage.tsx
import { useRoomContext } from "../RoomContext";
import RoomDashboard from "../components/RoomDashboard";
import { Link } from "react-router-dom";

export default function ChatDashboardPage() {
  const { rooms, activeRoomCode, setActiveRoomCode, sendMessage } = useRoomContext();

  return (
    // Use h-full for mobile, apply max-h constraints only on medium screens and up
    <div className="w-full h-full max-w-7xl mx-auto flex flex-col bg-zinc-900 md:h-[90vh] md:max-h-[800px] md:rounded-xl md:border md:border-zinc-700 md:shadow-2xl md:overflow-hidden">
      {/* Back Button */}
      <div className="p-3 border-b border-zinc-700 bg-zinc-800/50 md:rounded-t-xl shrink-0"> {/* Prevent shrinking */}
        <Link
          to="/"
          className="inline-flex items-center px-3 py-1 bg-zinc-700 text-zinc-200 rounded-lg hover:bg-zinc-600 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-[--color-primary-500]"
        >
          &larr; Back to Lobby
        </Link>
      </div>

      {/* The main dashboard UI - takes remaining space */}
      <RoomDashboard
        rooms={rooms}
        activeRoomCode={activeRoomCode}
        setActiveRoomCode={setActiveRoomCode}
        sendMessage={sendMessage}
      />
    </div>
  );
}