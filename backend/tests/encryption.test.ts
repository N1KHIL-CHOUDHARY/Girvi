import { describe, it, expect } from 'vitest';
import { encrypt, decrypt, getLast4Digits } from '../src/common/utils/encryption';

describe('AES-256-GCM Encryption Tests', () => {
  it('should encrypt a cleartext value and return a structured cipher string', () => {
    const secret = '123456789012'; // e.g. Aadhaar number
    const encrypted = encrypt(secret);

    expect(encrypted).toBeDefined();
    expect(encrypted).not.toEqual(secret);
    
    // Check colon split format: iv:authTag:ciphertext
    const components = encrypted.split(':');
    expect(components).toHaveLength(3);
  });

  it('should decrypt a cipher string back to original cleartext value', () => {
    const raw = 'ABCDE1234F'; // e.g. PAN card
    const cipher = encrypt(raw);
    const decrypted = decrypt(cipher);

    expect(decrypted).toEqual(raw);
  });

  it('should handle last 4 digit slicing correctly', () => {
    expect(getLast4Digits('1234-5678-9999')).toEqual('9999');
    expect(getLast4Digits('12345')).toEqual('2345');
    expect(getLast4Digits('123')).toEqual('123');
    expect(getLast4Digits(null)).toBeNull();
    expect(getLast4Digits(undefined)).toBeNull();
  });
});
