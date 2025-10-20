// src/utils/roomStore.js

/**
 * In-memory room storage.
 *
 * Map<roomCode, Room>
 *
 * Room: {
 * name: string,
 * expiresAt: number,
 * users: Set<WebSocket>,
 * meta: Map<WebSocket, { nickname: string, publicKeyJwk: object }>
 * }
 */
export const rooms = new Map();