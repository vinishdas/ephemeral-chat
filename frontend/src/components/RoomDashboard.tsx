import { useState } from "react";
import ChatRoom from "./ChatRoom";
import CreateRoomForm from "./CreateRoomForm";
import JoinRoomForm from "./JoinRoomForm";

interface Room {
  roomCode: string;
  roomName: string;
  expiresAt: number;
}

export default function RoomDashboard() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [nickname, setNickname] = useState("");

  const addRoom = (room: Room) => {
    setRooms((prev) => [...prev, room]);
    setActiveRoom(room);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Ephemeral Chat</h1>

      {!activeRoom ? (
        <div className="grid grid-cols-2 gap-4">
          <CreateRoomForm onRoomCreated={addRoom} />
          <JoinRoomForm onJoinedRoom={addRoom} />
        </div>
      ) : (
        <ChatRoom roomCode={activeRoom.roomCode} nickname={nickname} />
      )}

      {rooms.length > 0 && (
        <div className="mt-4 border-t pt-3">
          <h3 className="font-semibold">Your Active Rooms</h3>
          <ul className="flex gap-2 flex-wrap">
            {rooms.map((r) => (
              <li
                key={r.roomCode}
                className="cursor-pointer text-blue-600 underline"
                onClick={() => setActiveRoom(r)}
              >
                {r.roomName} ({r.roomCode})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
