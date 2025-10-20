// src/AppContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useWebSocket } from "./hooks/useWebSocket";
import { generateEcdhKeyPair, exportKey } from "./utils/crypto";

// Define the shape of the context
interface AppContextType {
  send: (type: string, payload: any) => void;
  onMessage: (cb: (msg: any) => void) => () => void;
  isConnected: boolean;
  userKeyPair: CryptoKeyPair | null;
  userPublicKeyJwk: JsonWebKey | null;
  username: string; // Added username
  setUsername: (name: string) => void; // Added setter
}

// Create the context
const AppContext = createContext<AppContextType | null>(null);

// Create the provider component
export function AppProvider({ children }: { children: ReactNode }) {
  const { send, onMessage, isConnected } = useWebSocket(import.meta.env.VITE_WS_URL);
  const [userKeyPair, setUserKeyPair] = useState<CryptoKeyPair | null>(null);
  const [userPublicKeyJwk, setUserPublicKeyJwk] = useState<JsonWebKey | null>(null);
  const [username, setUsername] = useState(""); // State for username

  // Generate the user's master key pair once on load
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

  // Wait until keys are generated before rendering the app
  return (
    <AppContext.Provider value={value}>
      {isConnected && userKeyPair ? children : <div className="p-4">Connecting to server and generating keys...</div>}
    </AppContext.Provider>
  );
}

// Create a custom hook to easily consume the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}