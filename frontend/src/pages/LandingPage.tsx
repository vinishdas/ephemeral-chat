// src/pages/LandingPage.tsx
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../AppContext";
import { useRoomContext } from "../RoomContext";
import CreateRoomForm from "../components/CreateRoomForm";
import JoinRoomForm from "../components/JoinRoomForm";
import type { RoomState } from "../types/types";

export default function LandingPage() {
  const { username, setUsername } = useAppContext();
  const { addRoom, rooms, setActiveRoomCode, activeRoomCode } = useRoomContext();
  const navigate = useNavigate();

  const handleRoomCreated = (room: RoomState, nickname: string) => {
    addRoom(room, nickname);
    setActiveRoomCode(room.roomCode);
    navigate("/dashboard");
  };

  const handleRoomJoined = (room: RoomState, nickname: string) => {
    addRoom(room, nickname);
    setActiveRoomCode(room.roomCode);
    navigate("/dashboard");
  };

  const handlePreviousRoomClick = (roomCode: string) => {
    setActiveRoomCode(roomCode);
    navigate("/dashboard");
  };

  return (
    // Centered content, max width, responsive padding, ensure flex-col for stacking
    <div className="p-4 w-full max-w-5xl mx-auto flex flex-col items-center">
      {/* Header with Gradient Text */}
      <div className="text-center mb-10 w-full"> {/* Ensure header takes width */}
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-[--color-primary-400] via-[--color-primary-500] to-[--color-primary-600] bg-clip-text  mb-2">
          Ephemeral Chat 
        </h1>
        <p className="text-lg text-zinc-400">
          Secure, private, end-to-end encrypted chat rooms.
        </p>
      </div>

      {/* Username Card */}
      <div className="w-full max-w-md mb-8 bg-zinc-900 border border-zinc-700 rounded-xl shadow-lg p-6 backdrop-blur-sm bg-opacity-80">
        <h2 className="text-xl font-semibold mb-4 text-center text-zinc-200">Set Your Username</h2>
        <input
          placeholder="Enter username..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full text-lg mb-2 text-center"
          required
          aria-label="Username"
        />
        <p className="text-xs text-zinc-500 text-center">
          Used across all rooms in this session.
        </p>
      </div>

      {/* Create/Join Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mb-12">
        <CreateRoomForm onRoomCreated={handleRoomCreated} />
        <JoinRoomForm onRoomJoined={handleRoomJoined} />
      </div>

      {/* Previously Joined Rooms Section */}
      {rooms.size > 0 && (
        <div className="mt-8 w-full max-w-5xl border-t border-zinc-700 pt-8">
          <h2 className="text-2xl font-semibold mb-6 text-center text-zinc-200">
            Rejoin a Room
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from(rooms.values()).map((room) => (
              <button
                key={room.roomCode}
                type="button"
                className={`
                  p-4 rounded-xl border text-left transition-all duration-200 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 focus:ring-[--color-primary-500]
                  ${
                    room.roomCode === activeRoomCode
                    ? 'bg-gradient-to-br from-[--color-primary-700]/30 to-[--color-primary-900]/30 border-[--color-primary-600]/50 shadow-lg shadow-[--color-primary-900]/30'
                    : 'bg-zinc-900 border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/60 shadow-md'
                  }
                `}
                onClick={() => handlePreviousRoomClick(room.roomCode)}
              >
                <div className="font-bold text-lg text-zinc-100 mb-1">{room.roomName}</div>
                <div className="text-sm text-[--color-primary-400] font-mono bg-[--color-primary-950]/50 px-2 py-0.5 rounded inline-block mb-2">
                  {room.roomCode}
                </div>
                <div className="text-xs text-zinc-400">
                  Participants: {room.participants.size}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}