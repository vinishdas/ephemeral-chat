// src/components/ChatRoom.tsx
import { useState } from "react";
// No longer importing QRCode
import type { RoomState } from "../types/types";

interface ChatRoomProps {
  roomState: RoomState;
  onSendMessage: (message: string) => void;
}

export default function ChatRoom({ roomState, onSendMessage }: ChatRoomProps) {
  const [input, setInput] = useState("");

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !roomState.roomSecret) return; // Don't send if no key
    onSendMessage(input);
    setInput("");
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* --- Header --- */}
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h3 className="font-bold text-xl">{roomState.roomName}</h3>
          <p className="text-sm text-gray-500">
            Code: <span className="font-mono font-bold">{roomState.roomCode}</span>
          </p>
        </div>
        {/* QR Code section removed */}
      </div>

      {/* --- Message List --- */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {roomState.messages.map((m) => (
          <div
            key={m.id}
            className={
              m.isSystem
                ? "text-center text-xs text-gray-500 italic"
                : "flex"
            }
          >
            {!m.isSystem && (
              <div className="p-2 px-3 rounded-lg bg-gray-200">
                <b className="text-blue-600">{m.sender}:</b> {m.text}
              </div>
            )}
            {m.isSystem && <div>{m.text}</div>}
          </div>
        ))}
        {!roomState.roomSecret && (
             <div className="text-center text-xs text-yellow-600 italic p-2 rounded bg-yellow-50 border border-yellow-200">
                <b>Waiting for key exchange...</b> Messages cannot be sent or decrypted until an existing member shares the room key.
             </div>
        )}
      </div>

      {/* --- Input Form --- */}
      <form onSubmit={sendMessage} className="flex gap-2 p-4 border-t">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={roomState.roomSecret ? "Type an encrypted message..." : "Waiting for keys..."}
          className="border p-2 flex-1 rounded"
          disabled={!roomState.roomSecret} // Disable input until E2EE is set up
        />
        <button 
          className="bg-blue-500 text-white px-4 rounded disabled:bg-gray-300"
          disabled={!roomState.roomSecret}
        >
          Send
        </button>
      </form>
    </div>
  );
}