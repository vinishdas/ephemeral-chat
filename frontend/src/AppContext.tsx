// src/AppContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useWebSocket } from "./hooks/useWebSocket";
import { generateEcdhKeyPair, exportKey } from "./utils/crypto";

// Define the shape of the context (no changes needed here)
interface AppContextType {
  send: (type: string, payload: any) => void;
  onMessage: (cb: (msg: any) => void) => () => void;
  isConnected: boolean;
  userKeyPair: CryptoKeyPair | null;
  userPublicKeyJwk: JsonWebKey | null;
  username: string;
  setUsername: (name: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

// Styled Loading component for dark theme
function AppLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 text-zinc-100">
      {/* Simple animated spinner using borders */}
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-[--color-primary-500] border-t-transparent mb-4"></div>
      <p className="text-zinc-400 text-lg">Connecting & Generating Keys...</p>
    </div>
  );
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { send, onMessage, isConnected } = useWebSocket(import.meta.env.VITE_WS_URL);
  const [userKeyPair, setUserKeyPair] = useState<CryptoKeyPair | null>(null);
  const [userPublicKeyJwk, setUserPublicKeyJwk] = useState<JsonWebKey | null>(null);
  const [username, setUsername] = useState("");

  useEffect(() => {
    async function initKeys() {
      const keys = await generateEcdhKeyPair();
      const pubKeyJwk = await exportKey(keys.publicKey);
      setUserKeyPair(keys);
      setUserPublicKeyJwk(pubKeyJwk);
    }
    initKeys();
  }, []);

  const value = {
    send,
    onMessage,
    isConnected,
    userKeyPair,
    userPublicKeyJwk,
    username,
    setUsername,
  };

  // Show loader until connected and keys are ready
  return (
    <AppContext.Provider value={value}>
      {isConnected && userKeyPair ? children : <AppLoader />}
    </AppContext.Provider>
  );
}

// useAppContext hook (no changes needed)
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}