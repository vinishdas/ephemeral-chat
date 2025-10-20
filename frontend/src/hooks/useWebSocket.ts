// frontend/src/hooks/useWebSocket.ts

import { useEffect, useRef, useState } from "react";

type Listener = (msg: any) => void;

export function useWebSocket(url: string) {
  // wsRef stores the *current* active WebSocket, primarily for the send function
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setConnected] = useState(false);
  const listeners = useRef<Listener[]>([]);

  useEffect(() => {
    console.log('Attempting WebSocket connection to:', url);

    if (!url || !url.startsWith('ws://')) {
      console.error('Invalid WebSocket URL:', url);
      setConnected(false);
      return;
    }

    let wsInstance: WebSocket | null = null; // Variable local to this effect run
    let isCleaningUp = false; // Flag to prevent race conditions on close

    try {
      wsInstance = new WebSocket(url); // Assign to local variable
      wsRef.current = wsInstance; // Update ref for external use (send function)

      wsInstance.onopen = () => {
        if (isCleaningUp) return; // Don't set connected if cleanup already started
        console.log('WebSocket connection opened');
        setConnected(true);
      };

      wsInstance.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason, event.wasClean);
        // Only set connected to false if this is the *current* ws instance closing
        // This prevents the StrictMode cleanup from prematurely setting isConnected to false
        // before the second mount's connection succeeds.
        if (wsRef.current === wsInstance) {
          setConnected(false);
          wsRef.current = null; // Clear the ref if the current one closed
        }
      };

      wsInstance.onerror = (error) => {
        console.error('WebSocket error:', error);
         // Similar logic as onclose
        if (wsRef.current === wsInstance) {
          setConnected(false);
          wsRef.current = null;
        }
      };

      wsInstance.onmessage = (msg) => {
        if (isCleaningUp) return; // Ignore messages during cleanup
        try {
          const data = JSON.parse(msg.data);
          // Make sure listeners array isn't modified during iteration (though less likely here)
          [...listeners.current].forEach((cb) => cb(data));
        } catch (e) {
          console.error("Failed to parse WebSocket message:", msg.data, e);
        }
      };

    } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        setConnected(false); // Ensure state reflects connection failure
        wsRef.current = null; // Clear ref on creation error
    }

    // --- Cleanup Function ---
    return () => {
      isCleaningUp = true; // Set flag
      // Only close the specific instance created in *this* effect run
      if (wsInstance) {
        console.log('Closing WebSocket instance:', url);
        wsInstance.close();

        // If this instance is also the *currently active* one in the ref, clear the ref
        if (wsRef.current === wsInstance) {
          wsRef.current = null;
          // Set connected to false immediately on cleanup initiated by this effect instance
          // This handles cases like component unmount or URL change
          setConnected(false);
        }
      } else {
        console.log('Cleanup called but no wsInstance to close (likely connection error)');
      }
    };

  }, [url]); // Dependency array is correct

  // Send function remains mostly the same, uses the ref
  const send = (type: string, payload: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
       wsRef.current?.send(JSON.stringify({ type, payload }));
    } else {
       console.warn('WebSocket not open. Cannot send message:', type, payload);
    }
  };

  // onMessage remains the same
  const onMessage = (cb: Listener) => {
    listeners.current.push(cb);
    return () => {
      listeners.current = listeners.current.filter((f) => f !== cb);
    };
  };

  return { send, onMessage, isConnected };
}