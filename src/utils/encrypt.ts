// ============================================================
// AES-256 Encryption wrapper for localStorage
// ============================================================

import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = import.meta.env.VITE_STORAGE_KEY || 'ecosense-local-key-v1';

/**
 * Encrypt data before storing in localStorage.
 * @param data The raw data to encrypt
 * @returns The encrypted string representation
 * @example
 * const cipher = encryptData({ secret: 'info' });
 */
export const encryptData = (data: unknown): string => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
};

/**
 * Decrypt data retrieved from localStorage.
 * @param cipher The encrypted string to decrypt
 * @returns The decrypted and parsed object of type T
 * @throws Error if decryption fails or data is corrupted
 * @example
 * const data = decryptData<{ secret: string }>(cipher);
 */
export const decryptData = <T>(cipher: string): T => {
  const bytes = CryptoJS.AES.decrypt(cipher, ENCRYPTION_KEY);
  const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
  if (!decryptedString) {
    throw new Error('Failed to decrypt data — invalid key or corrupted data');
  }
  return JSON.parse(decryptedString) as T;
};
