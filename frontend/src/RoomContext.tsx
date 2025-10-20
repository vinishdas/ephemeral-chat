// src/RoomContext.tsx
// import { createContext, useContext, ReactNode } from "react";
// import { useRoomManager } from "./hooks/useRoomManager";
// Removed unused 'RoomState' import
// import type { RoomState } from "./types/types"; 
import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useRoomManager } from "./hooks/useRoomManager";
// Get the return type of the hook to define our context
type RoomManagerType = ReturnType<typeof useRoomManager>;

const RoomContext = createContext<RoomManagerType | null>(null);

// Provider component that runs the hook
export function RoomProvider({ children }: { children: ReactNode }) {
  const roomManager = useRoomManager();
  return (
    <RoomContext.Provider value={roomManager}>{children}</RoomContext.Provider>
  );
}

// Custom hook to consume the room state
export function useRoomContext() {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error("useRoomContext must be used within a RoomProvider");
  }
  return context;
}