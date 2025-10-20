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
}
