// src/components/ChatRoom.tsx
import { useState, useRef, useEffect } from "react";
import type { RoomState } from "../types/types";

interface ChatRoomProps {
  roomState: RoomState;
  onSendMessage: (message: string) => void;
}

export default function ChatRoom({ roomState, onSendMessage }: ChatRoomProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [roomState.messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !roomState.roomSecret) return;
    onSendMessage(input);
    setInput("");
  };

  return (
    // Ensure this component fills its parent flex container
    <div className="flex-1 flex flex-col h-full bg-zinc-800/30 overflow-hidden min-h-0"> {/* Added min-h-0 */}
      {/* --- Header --- */}
      <div className="p-4 border-b border-zinc-700 flex justify-between items-center bg-zinc-900 shrink-0">
        <div>
          <h3 className="font-bold text-xl text-zinc-100 truncate max-w-[200px] sm:max-w-xs md:max-w-md" title={roomState.roomName}>
            {roomState.roomName}
          </h3>
          <p className="text-sm text-zinc-400">
            Code: <span className="font-mono font-bold text-[--color-primary-400]">{roomState.roomCode}</span>
          </p>
        </div>
         <div className="text-xs text-zinc-500 shrink-0 ml-4">
            Participants: {roomState.participants.size}
        </div>
      </div>

      {/* --- Message List --- */}
      {/* Ensure this div grows to fill space and scrolls */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar min-h-0"> {/* Added min-h-0 */}
        {roomState.messages.map((m) => {
          // Check if the message is from the current user ('self')
          const isSelf = m.sender === roomState.selfNickname && !m.isSystem;
          return (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.isSystem ? 'items-center my-2' : isSelf ? 'items-end' : 'items-start'
              }`}
            >
              {/* Sender name (only for others) */}
              {!m.isSystem && !isSelf && (
                <div className="text-xs text-zinc-500 mb-1 px-1">
                  {m.sender}
                </div>
              )}
              {/* Message bubble */}
              <div
                className={`
                  p-2 px-4 rounded-2xl max-w-[80%] sm:max-w-[70%] md:max-w-[60%] break-words shadow-sm
                  ${
                    m.isSystem
                      ? 'text-center text-xs text-zinc-500 italic bg-zinc-700/30 py-1' // System message
                      : isSelf
                      ? 'bg-gradient-to-br from-[var(--color-primary-600)] to-[var(--color-primary-800)] text-white rounded-br-lg' // *** SENT MESSAGE STYLE ***
                      : 'bg-zinc-700 text-zinc-100 rounded-bl-lg' // Received message
                  }
                `}
              >
                {m.text}
              </div>
            </div>
          );
        })}
        {/* Waiting for key message */}
         {!roomState.roomSecret && (
             <div className="flex items-center justify-center text-center text-xs text-yellow-400 italic p-3 rounded-lg bg-yellow-900/40 border border-yellow-700/60 my-2 gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
                  <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
                </svg>
                <span><b>Waiting for key exchange...</b> Messages cannot be sent or decrypted.</span>
             </div>
        )}
        <div ref={messagesEndRef} className="h-0" />
      </div>

      {/* --- Input Form --- */}
      <form onSubmit={sendMessage} className="flex gap-2 p-3 border-t border-zinc-700 bg-zinc-900 shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={roomState.roomSecret ? "Type an encrypted message..." : "Waiting for keys..."}
          className="flex-1 bg-zinc-700 border-zinc-600 focus:border-[--color-primary-500] focus:ring-[--color-primary-500]"
          disabled={!roomState.roomSecret}
          autoComplete="off"
          aria-label="Chat message input"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center justify-center aspect-square h-10 w-10"
          disabled={!roomState.roomSecret || !input.trim()}
          aria-label="Send message"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M3.105 3.105a1.5 1.5 0 0 1 1.995-.44l11 4A1.5 1.5 0 0 1 17 8.5v.038l.001.002.002.002.006.003a1.49 1.49 0 0 1 .018.006l.006.002a1.5 1.5 0 0 1 .208.1.02.02 0 0 0 .002.002l.003.002a1.5 1.5 0 0 1 .18.17l4 4a1.5 1.5 0 0 1 0 2.121l-4 4a1.5 1.5 0 0 1-2.12 0l-.171-.171a1.5 1.5 0 0 1-.168-.194l-.004-.004a1.5 1.5 0 0 1-.002-.003l-3.493 3.5a1.5 1.5 0 0 1-2.122-2.122l3.5-3.493a1.5 1.5 0 0 1-.003-.002l-.004-.004a1.5 1.5 0 0 1-.194-.168l-.171-.171a1.5 1.5 0 0 1 0-2.121l4-4a1.5 1.5 0 0 1 .1-.208l.002-.006a1.49 1.49 0 0 1 .006-.018l.002-.006.002-.002.001-.002v-.038a1.5 1.5 0 0 1-.44-1.995l-4-11Z" />
          </svg>
        </button>
      </form>
    </div>
  );
}