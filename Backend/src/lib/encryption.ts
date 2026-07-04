import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const ivLength = 16;

const resolveKey = (): Buffer => {
  const secret = process.env.ENCRYPTION_KEY;
  if (!secret) {
    throw new Error('ENCRYPTION_KEY is required.');
  }

  if (/^[0-9a-fA-F]{64}$/.test(secret)) {
    return Buffer.from(secret, 'hex');
  }

  return crypto.createHash('sha256').update(secret).digest();
};

export const encryptText = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }

  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, resolveKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
};

export const decryptText = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }

  const [ivHex, authTagHex, encryptedHex] = value.split(':');
  if (!ivHex || !authTagHex || !encryptedHex) {
    return value;
  }

  const decipher = crypto.createDecipheriv(algorithm, resolveKey(), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedHex, 'hex')), decipher.final()]);
  return decrypted.toString('utf8');
};
