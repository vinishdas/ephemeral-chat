// src/pages/ChatDashboardPage.tsx
import { useRoomContext } from "../RoomContext";
import RoomDashboard from "../components/RoomDashboard";
import { Link } from "react-router-dom";

export default function ChatDashboardPage() {
  // Removed 'addRoom' from destructuring
  const { rooms, activeRoomCode, setActiveRoomCode, sendMessage } = useRoomContext();

  return (
    <div className="w-[90vw] max-w-4xl h-[80vh] bg-white rounded-xl shadow-2xl flex flex-col">
      {/* Back Button */}
      <div className="p-2 border-b">
        <Link 
          to="/" 
          className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          &larr; Back to Lobby
        </Link>
      </div>

      {/* The main dashboard UI */}
      <RoomDashboard
        rooms={rooms}
        activeRoomCode={activeRoomCode}
        setActiveRoomCode={setActiveRoomCode}
        sendMessage={sendMessage}
      />
    </div>
  );
}