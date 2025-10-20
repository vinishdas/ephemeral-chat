// src/hooks/useRoomManager.ts
import { useState, useEffect } from "react";
import type { RoomState, Participant, ChatMessage } from "../types/types";
import { useAppContext } from "../AppContext";
import {
  importPublicKey,
  deriveSharedSecret,
  importAesKey,
  decryptMessage,
  exportKey,
  encryptMessage,
} from "../utils/crypto";

export function useRoomManager() {
  const { send, onMessage, userKeyPair, userPublicKeyJwk } = useAppContext();
  const [rooms, setRooms] = useState<Map<string, RoomState>>(new Map());
  const [activeRoomCode, setActiveRoomCode] = useState<string | null>(null);

  // --- System Messages ---
  const addSystemMessage = (roomCode: string, text: string) => {
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(), // Use UUID for system messages too
      sender: "System",
      text,
      isSystem: true,
    };
    setRooms((prev) => {
      const newRooms = new Map(prev);
      const room = newRooms.get(roomCode);
      if (room) {
        // Prevent duplicate system messages
        if (!room.messages.some(m => m.id === newMessage.id || (m.text === text && m.isSystem))) {
          room.messages.push(newMessage);
        }
      }
      return newRooms;
    });
  };

  // --- Message Dispatcher ---
  useEffect(() => {
    const shareRoomSecret = async (room: RoomState, participant: Participant) => {
     // ... (unchanged from previous correct version)
       if (!room.roomSecret || !userKeyPair) return;
      try {
          const sharedSecret = await deriveSharedSecret(
          userKeyPair.privateKey,
          participant.publicKey
          );
          const roomKeyJwk = await exportKey(room.roomSecret);
          const encryptedKey = await encryptMessage(sharedSecret, JSON.stringify(roomKeyJwk));
          console.log(`[${room.roomCode}] Sharing room secret with ${participant.nickname}`);
          send("share_key", {
          roomCode: room.roomCode,
          toNickname: participant.nickname,
          encryptedKey,
          });
      } catch (e) {
          console.error(`[${room.roomCode}] Failed to share secret with ${participant.nickname}:`, e);
      }
    };

    const unsub = onMessage(async (msg) => {
      if (!userKeyPair || !userPublicKeyJwk) {
          console.warn("Received message before user keys were ready. Skipping.", msg.type);
          return;
      }

      const { type, payload, roomCode } = msg;

      if (!roomCode) return;

      const initialRoomState = rooms.get(roomCode);

      if (!initialRoomState) {
          console.log(`Received message for unknown or deleted room ${roomCode}. Type: ${type}`);
          return;
      }

      switch (type) {
        // ... (user_joined, existing_participants, key_share, user_left cases unchanged) ...
         case "user_joined": {
          const { nickname, publicKeyJwk } = payload;
          if (JSON.stringify(publicKeyJwk) === JSON.stringify(userPublicKeyJwk)) {
            return; // Ignore self
          }

          if(initialRoomState.participants.has(nickname)) return; // Already joined

          addSystemMessage(roomCode, `${nickname} joined the room.`);
          const newParticipant: Participant = {
            nickname,
            publicKeyJwk,
            publicKey: await importPublicKey(publicKeyJwk),
          };
          setRooms(prev => {
            const newRooms = new Map(prev);
            const currentRoom = newRooms.get(roomCode);
            if (currentRoom && !currentRoom.participants.has(nickname)) {
              currentRoom.participants.set(nickname, newParticipant);
            }
            return newRooms;
          });
          if (initialRoomState.roomSecret) {
            shareRoomSecret(initialRoomState, newParticipant);
          }
          break;
        }

        case "existing_participants": {
          const participantsPayload: { nickname: string; publicKeyJwk: JsonWebKey }[] = payload;

          const importedParticipants: Participant[] = [];
          for (const p of participantsPayload) {
             if (JSON.stringify(p.publicKeyJwk) === JSON.stringify(userPublicKeyJwk)) {
                continue;
             }
             if (!initialRoomState.participants.has(p.nickname)) {
                 try {
                     const publicKey = await importPublicKey(p.publicKeyJwk);
                     importedParticipants.push({
                         nickname: p.nickname,
                         publicKeyJwk: p.publicKeyJwk,
                         publicKey: publicKey,
                     });
                 } catch(e) {
                     console.error(`Failed to import public key for ${p.nickname}`, e);
                 }
             }
          }

          if (importedParticipants.length > 0) {
              setRooms(prev => {
                const newRooms = new Map(prev);
                const currentRoom = newRooms.get(roomCode);
                if (!currentRoom) return prev;

                const newParticipantsMap = new Map(currentRoom.participants);
                importedParticipants.forEach(p => {
                    if (!newParticipantsMap.has(p.nickname)) {
                        newParticipantsMap.set(p.nickname, p);
                    }
                });

                currentRoom.participants = newParticipantsMap;
                return newRooms;
              });
          }
          break;
        }


        case "key_share": {
          if (initialRoomState.roomSecret) {
              console.log(`[${roomCode}] Already have room secret, ignoring key_share.`);
              return;
          }

          console.log(`[${roomCode}] Received key_share:`, payload);
          const { fromNickname, fromPublicKeyJwk, encryptedKey } = payload;

          if (!fromPublicKeyJwk) {
            console.error(`[${roomCode}] Received key_share without public key.`);
            return;
          }

          try {
            console.log(`[${roomCode}] 1. Importing sender's public key...`);
            const senderPublicKey = await importPublicKey(fromPublicKeyJwk);
            console.log(`[${roomCode}] 1. Sender's public key imported.`);

            console.log(`[${roomCode}] 2. Deriving shared secret with ${fromNickname}...`);
            const sharedSecret = await deriveSharedSecret(
              userKeyPair.privateKey,
              senderPublicKey
            );
            console.log(`[${roomCode}] 2. Shared secret derived.`);

            console.log(`[${roomCode}] 3. Decrypting room key...`);
            const roomKeyJwkString = await decryptMessage(sharedSecret, encryptedKey);
            console.log(`[${roomCode}] 3. Room key decrypted (JWK string).`);

            if (!roomKeyJwkString || roomKeyJwkString.startsWith("⚠️")) {
               throw new Error("Decryption failed or produced invalid result.");
            }
            const roomKeyJwk = JSON.parse(roomKeyJwkString);
            console.log(`[${roomCode}] 3a. Parsed room key JWK:`, roomKeyJwk);


            console.log(`[${roomCode}] 4. Importing AES room key...`);
            const roomSecret = await importAesKey(roomKeyJwk);
            console.log(`[${roomCode}] 4. AES room key imported successfully.`);

            setRooms(prev => {
              const newRooms = new Map(prev);
              const currentRoom = newRooms.get(roomCode);
              if (currentRoom && !currentRoom.roomSecret) {
                currentRoom.roomSecret = roomSecret;
                console.log(`[${roomCode}] 5. Room secret updated in state.`);
              } else {
                 console.error(`[${roomCode}] Room not found or secret already set during final update!`);
              }
              return newRooms;
            });

            addSystemMessage(roomCode, `🔒 End-to-end encryption established with ${fromNickname}!`);

          } catch (error) {
            console.error(`[${roomCode}] Error processing key_share from ${fromNickname}:`, error);
            addSystemMessage(roomCode, `⚠️ Error establishing secure connection with ${fromNickname}. Check console.`);
          }
          break;
        }


        case "message": {
          const { nickname, encryptedMessage } = payload;
          const secretToUse = initialRoomState.roomSecret;

          if (!secretToUse) {
             if (!initialRoomState.messages.some(m => m.isSystem && m.text.includes(`key is not established`))) {
                addSystemMessage(roomCode, `Received message from ${nickname}, but key is not established.`);
             }
            return;
          }

          // --- FIX: Check if this message came from ourselves ---
          // If the nickname matches our nickname for this room, and we *just* added
          // this message via local echo, we should ignore this broadcast.
          // This requires comparing the *decrypted* text.
          if (nickname === initialRoomState.selfNickname) {
             // Try to decrypt silently to compare
             try {
                const potentialDecryptedText = await decryptMessage(secretToUse, encryptedMessage);
                // Check if the last message added locally matches this incoming one
                if (initialRoomState.messages.length > 0) {
                    const lastLocalMessage = initialRoomState.messages[initialRoomState.messages.length - 1];
                    if (lastLocalMessage.sender === nickname && lastLocalMessage.text === potentialDecryptedText && !lastLocalMessage.isSystem) {
                        console.log(`[${roomCode}] Ignoring own message broadcast for:`, potentialDecryptedText);
                        return; // Ignore the broadcast of our own message
                    }
                }
             } catch (e) {
                 // Decryption failed, might not be our message, proceed to normal handling
                 console.warn(`[${roomCode}] Decryption check failed for potential self-message. Proceeding.`, e);
             }
          }
          // --- END FIX ---


          try {
            const decryptedText = await decryptMessage(secretToUse, encryptedMessage);
            const newMessage: ChatMessage = {
              id: crypto.randomUUID(), // Assign a new ID upon receiving
              sender: nickname,
              text: decryptedText,
              isSystem: false,
            };
            setRooms(prev => {
              const newRooms = new Map(prev);
              const currentRoom = newRooms.get(roomCode);
              // Check by ID generated above, or content if needed
              if (currentRoom && !currentRoom.messages.some(m => m.id === newMessage.id)) {
                  currentRoom.messages.push(newMessage);
              }
              return newRooms;
            });
          } catch(e) {
             console.error(`[${roomCode}] Failed to decrypt message from ${nickname}:`, e);
              addSystemMessage(roomCode, `⚠️ Failed to decrypt message from ${nickname}.`);
          }
          break;
        }

        case "user_left": {
          const { nickname } = payload;
           if (initialRoomState.participants.has(nickname)) {
              addSystemMessage(roomCode, `${nickname} left the room.`);
              setRooms(prev => {
                const newRooms = new Map(prev);
                const currentRoom = newRooms.get(roomCode);
                if(currentRoom) currentRoom.participants.delete(nickname);
                return newRooms;
              });
           }
          break;
        }
      }
    });

    return unsub;
  }, [onMessage, rooms, userKeyPair, userPublicKeyJwk, send]);


  /**
   * Adds a new room to the state (called by Create/Join forms).
   */
  const addRoom = (roomState: RoomState, selfNickname: string) => {
    roomState.selfNickname = selfNickname;
    setRooms((prev) => new Map(prev).set(roomState.roomCode, roomState));
    if (!activeRoomCode) {
      setActiveRoomCode(roomState.roomCode);
    }
  };

  /**
   * Sends an encrypted chat message.
   */
  const sendMessage = async (text: string) => {
     if (!activeRoomCode) return;

    const roomToSendFrom = rooms.get(activeRoomCode);

    if (!roomToSendFrom || !roomToSendFrom.roomSecret) {
        console.warn(`[${activeRoomCode}] Cannot send message, room secret not available.`);
        return;
    }
    const secretToUse = roomToSendFrom.roomSecret;
    const selfNickname = roomToSendFrom.selfNickname; // Get selfNickname

    try {
        const encryptedMessage = await encryptMessage(secretToUse, text);

        // --- FIX: Re-introduce Local Echo ---
        const newMessage: ChatMessage = {
          id: crypto.randomUUID(), // Generate a unique ID for local echo
          sender: selfNickname,   // Use selfNickname
          text: text,
          isSystem: false,
        };
        setRooms(prev => {
          const newRooms = new Map(prev);
          const currentRoom = newRooms.get(activeRoomCode);
          // Add locally immediately
          if (currentRoom && !currentRoom.messages.some(m => m.id === newMessage.id)) { // Prevent duplicates if somehow called twice quickly
             currentRoom.messages.push(newMessage);
          }
          return newRooms;
        });
        // --- END FIX ---

        send("chat_message", {
          roomCode: activeRoomCode,
          encryptedMessage: encryptedMessage,
        });
    } catch(e) {
        console.error(`[${activeRoomCode}] Failed to encrypt or send message:`, e);
        addSystemMessage(activeRoomCode, `⚠️ Failed to send message.`);
    }
  };

  return { rooms, addRoom, activeRoomCode, setActiveRoomCode, sendMessage };
}