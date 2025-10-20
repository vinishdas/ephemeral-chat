// src/types/types.ts
export interface RoomInfo {
  roomCode: string;
  roomName: string;
  expiresAt: number;
}

export interface UserInfo {
  nickname: string;
}

export interface ServerMessage {
  type: string;
  payload: any;
  roomCode?: string; 
}

// --- New Types for E2EE ---

export interface Participant {
  nickname: string;
  publicKey: CryptoKey;
  publicKeyJwk: JsonWebKey;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  isSystem: boolean;
}

export interface RoomState {
  roomCode: string;
  roomName: string;
  expiresAt: number;
  participants: Map<string, Participant>;
  messages: ChatMessage[];
  roomSecret: CryptoKey | null;
  selfNickname: string; // <-- ADDED THIS
}