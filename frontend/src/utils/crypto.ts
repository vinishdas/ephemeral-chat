// src/utils/crypto.ts

/**
 * --- E2EE Strategy ---
 * 1.  User Master Keys: Each user generates a permanent (for the session) ECDH (Diffie-Hellman) key pair.
 * 2.  Room Symmetric Key: The *creator* of a room generates a separate, symmetric AES-GCM key. This is the "room key".
 * 3.  Secure Key Exchange:
 * - When a new user joins, they send their public key.
 * - The creator (or any existing member) computes a "shared secret" with the new user using (MyPrivateKey + NewUserPublicKey).
 * - They *encrypt* the "room key" using this shared secret and send it *only* to the new user.
 * 4.  Chatting:
 * - All messages in the room are encrypted/decrypted using the one shared "room key".
 * - The server only ever sees the encrypted blobs.
 */

const ECDH_PARAMS = { name: "ECDH", namedCurve: "P-256" };
const AES_PARAMS = { name: "AES-GCM", length: 256 };
const AES_IV_LENGTH = 12; // 12 bytes for AES-GCM IV

/**
 * Generates a master ECDH key pair for key exchange.
 */
export async function generateEcdhKeyPair(): Promise<CryptoKeyPair> {
  return window.crypto.subtle.generateKey(ECDH_PARAMS, true, ["deriveKey", "deriveBits"]);
}

/**
 * Generates a symmetric AES-GCM key for encrypting/decrypting messages.
 */
export async function generateAesKey(): Promise<CryptoKey> {
  return window.crypto.subtle.generateKey(AES_PARAMS, true, ["encrypt", "decrypt"]);
}

/**
 * Derives a shared secret (which will be used as an AES key)
 * from your private key and their public key.
 */
export async function deriveSharedSecret(
  privateKey: CryptoKey,
  publicKey: CryptoKey
): Promise<CryptoKey> {
  return window.crypto.subtle.deriveKey(
    { name: "ECDH", public: publicKey },
    privateKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts a string message.
 * Returns a base64-encoded string of "iv.ciphertext"
 */
export async function encryptMessage(key: CryptoKey, message: string): Promise<string> {
  const iv = window.crypto.getRandomValues(new Uint8Array(AES_IV_LENGTH));
  const encodedMessage = new TextEncoder().encode(message);

  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encodedMessage
  );

  // Combine IV and ciphertext into one buffer
  const ivAndCiphertext = new Uint8Array(iv.length + ciphertext.byteLength);
  ivAndCiphertext.set(iv);
  ivAndCiphertext.set(new Uint8Array(ciphertext), iv.length);

  // Return as base64 string
  return btoa(String.fromCharCode.apply(null, Array.from(ivAndCiphertext)));
}

/**
 * Decrypts a base64-encoded string (iv.ciphertext)
 */
export async function decryptMessage(key: CryptoKey, base64Ciphertext: string): Promise<string> {
  try {
    const ivAndCiphertext = new Uint8Array(
      atob(base64Ciphertext).split("").map((c) => c.charCodeAt(0))
    );

    const iv = ivAndCiphertext.slice(0, AES_IV_LENGTH);
    const ciphertext = ivAndCiphertext.slice(AES_IV_LENGTH);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      ciphertext
    );

    return new TextDecoder().decode(decrypted);
  } catch (e) {
    console.error("Decryption failed", e);
    return "⚠️ Decryption failed. Message may be corrupt or key is wrong.";
  }
}

/**
 * Exports a CryptoKey (public or private) to a JSON-serializable format (JWK).
 */
export async function exportKey(key: CryptoKey): Promise<JsonWebKey> {
  return window.crypto.subtle.exportKey("jwk", key);
}

/**
 * Imports a public ECDH key from its JWK format.
 */
export async function importPublicKey(jwk: JsonWebKey): Promise<CryptoKey> {
  return window.crypto.subtle.importKey("jwk", jwk, ECDH_PARAMS, true, []);
}

/**
 * Imports a symmetric AES key from its JWK format.
 */
export async function importAesKey(jwk: JsonWebKey): Promise<CryptoKey> {
  return window.crypto.subtle.importKey("jwk", jwk, AES_PARAMS, true, ["encrypt", "decrypt"]);
}