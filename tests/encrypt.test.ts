import { describe, it, expect } from 'vitest';
import { encryptData, decryptData } from '@/utils/encrypt';

describe('Encryption Utilities', () => {
  const testData = { name: 'EcoSense User', budget: 200, active: true };

  it('should encrypt data to a string and not match the original JSON', () => {
    const cipher = encryptData(testData);
    expect(typeof cipher).toBe('string');
    expect(cipher).not.toBe(JSON.stringify(testData));
  });

  it('should decrypt back to the original data structure', () => {
    const cipher = encryptData(testData);
    const decrypted = decryptData<{ name: string; budget: number; active: boolean }>(cipher);
    expect(decrypted).toEqual(testData);
  });

  it('should throw an error on corrupted or invalid cipher text', () => {
    expect(() => decryptData('invalid-cipher-text')).toThrow();
  });
});
