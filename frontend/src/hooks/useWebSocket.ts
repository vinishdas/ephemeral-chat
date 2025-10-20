import { useEffect, useRef, useState } from "react";

type Listener = (msg: any) => void;

export function useWebSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setConnected] = useState(false);
  const listeners = useRef<Listener[]>([]);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      listeners.current.forEach((cb) => cb(data));
    };

    wsRef.current = ws;
    return () => ws.close();
  }, [url]);

  const send = (type: string, payload: any) => {
    wsRef.current?.send(JSON.stringify({ type, payload }));
  };

  const onMessage = (cb: Listener) => {
    listeners.current.push(cb);
    return () => {
      listeners.current = listeners.current.filter((f) => f !== cb);
    };
  };

  return { send, onMessage, isConnected };
}
