import { useState, useEffect } from "react";
import { useWebSocket } from "../hooks/useWebSocket";

interface ChatRoomProps {
  roomCode: string;
  nickname: string;
}

export default function ChatRoom({ roomCode, nickname }: ChatRoomProps) {
  const { send, onMessage } = useWebSocket(import.meta.env.VITE_WS_URL);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");

//   useEffect(() => {
//     const unsub = onMessage((msg) => {
//       if (msg.type === "message" && msg.payload) {
//         setMessages((prev) => [...prev, { sender: msg.payload.nickname, text: msg.payload.message }]);
//       }
//     });
//     return unsub;
//   }, []);
useEffect(() => {
  const unsub = onMessage((msg) => {
    switch (msg.type) {
      case "message":
        setMessages(prev => [...prev, { sender: msg.payload.nickname, text: msg.payload.message }]);
        break;
      case "user_joined":
        setMessages(prev => [...prev, { sender: "System", text: `${msg.payload.nickname} joined the room` }]);
        break;
    }
  });
  return unsub;
}, []);



  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    send("chat_message", { roomCode, message: input });
    setMessages((prev) => [...prev, { sender: nickname, text: input }]);
    setInput("");
  };

  return (
    <div className="flex flex-col border rounded-xl p-4 bg-gray-50 h-[400px]">
      <h3 className="font-bold mb-2">Room: {roomCode}</h3>
      <div className="flex-1 overflow-y-auto border p-2 mb-3 rounded bg-white">
        {messages.map((m, i) => (
          <div key={i} className={`p-1 ${m.sender === nickname ? "text-blue-600" : "text-gray-800"}`}>
            <b>{m.sender}:</b> {m.text}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="border p-2 flex-1 rounded"
        />
        <button className="bg-blue-500 text-white px-4 rounded">Send</button>
      </form>
    </div>
  );
}
