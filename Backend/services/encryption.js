const crypto = require('crypto');
require('dotenv').config();

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const IV_LENGTH = 16; 
const AUTH_TAG_LENGTH = 16;

function encrypt(text) {
  if (!text) return text;
  
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Store iv, authTag, and encrypted data together, separated by colons
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  
  } catch (error) {
    console.error("Encryption failed:", error);
    return text; // Fallback to plain text if encryption fails
  }
}

function decrypt(encryptedText) {
  if (!encryptedText) return encryptedText;

  try {
    const parts = encryptedText.split(':');
    // If it's not in our format (e.g., old data or failed encryption), return it as is.
    if (parts.length !== 3) return encryptedText; 

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    return encryptedText; // Return original text if decryption fails
  }
}

module.exports = { encrypt, decrypt };