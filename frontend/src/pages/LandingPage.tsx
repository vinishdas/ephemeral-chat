// src/pages/LandingPage.tsx
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../AppContext";
import { useRoomContext } from "../RoomContext";
import CreateRoomForm from "../components/CreateRoomForm";
import JoinRoomForm from "../components/JoinRoomForm";
import type { RoomState } from "../types/types";

export default function LandingPage() {
  const { username, setUsername } = useAppContext();
  // Get rooms and setActiveRoomCode from RoomContext
  const { addRoom, rooms, setActiveRoomCode } = useRoomContext();
  const navigate = useNavigate();

  const handleRoomCreated = (room: RoomState, nickname: string) => {
    addRoom(room, nickname);
    setActiveRoomCode(room.roomCode); // Set as active immediately
    navigate("/dashboard");
  };

  const handleRoomJoined = (room: RoomState, nickname: string) => {
    addRoom(room, nickname);
    setActiveRoomCode(room.roomCode); // Set as active immediately
    navigate("/dashboard");
  };

  // --- New Function: Handle clicking a previous room ---
  const handlePreviousRoomClick = (roomCode: string) => {
    setActiveRoomCode(roomCode); // Set the clicked room as active
    navigate("/dashboard");      // Navigate to the dashboard
  };
  // --- End New Function ---

  return (
    <div className="p-4 w-full max-w-lg mx-auto"> {/* Increased max-width slightly */}
      <h1 className="text-3xl font-bold mb-6 text-center">Ephemeral E2EE Chat</h1>

      {/* Username Input */}
      <div className="p-4 flex flex-col gap-3 border rounded-xl bg-white shadow mb-6">
        <h2 className="text-lg font-bold">Your Username</h2>
        <input
          placeholder="Enter your persistent username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 rounded"
          required
        />
         <p className="text-xs text-gray-500">This name will be used for all rooms you join in this session.</p>
      </div>

      {/* Create/Join Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <CreateRoomForm onRoomCreated={handleRoomCreated} />
        <JoinRoomForm onRoomJoined={handleRoomJoined} />
      </div>

      {/* --- New Section: Previously Joined Rooms --- */}
      {rooms.size > 0 && (
        <div className="mt-8 border-t pt-6">
          <h2 className="text-xl font-semibold mb-4 text-center">Previously Joined Rooms</h2>
          <div className="flex flex-col gap-3">
            {Array.from(rooms.values()).map((room) => (
              <div
                key={room.roomCode}
                className="cursor-pointer p-4 rounded-lg border bg-white hover:bg-gray-50 border-gray-200 shadow-sm"
                onClick={() => handlePreviousRoomClick(room.roomCode)} // Use the new handler
              >
                <div className="font-bold text-lg">{room.roomName}</div>
                <div className="text-sm text-gray-500 font-mono">{room.roomCode}</div>
                {/* Optional: Add participant count or expiry info here later */}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* --- End New Section --- */}

    </div>
  );
}