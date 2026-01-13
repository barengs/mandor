import CryptoJS from 'crypto-js';

// Encryption key - in production, this should be securely managed per user/project
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'mandor-chat-secret-key-2026';

/**
 * Encrypt a message
 */
export const encryptMessage = (message) => {
    if (!message) return message;
    try {
        return CryptoJS.AES.encrypt(message, ENCRYPTION_KEY).toString();
    } catch (error) {
        console.error('Encryption failed:', error);
        return message;
    }
};

/**
 * Decrypt a message
 */
export const decryptMessage = (encryptedMessage) => {
    if (!encryptedMessage) return encryptedMessage;
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedMessage, ENCRYPTION_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        // Return original if decryption fails (for old unencrypted messages)
        return decrypted || encryptedMessage;
    } catch (error) {
        // Return original message if decryption fails
        return encryptedMessage;
    }
};

/**
 * Check if a message is encrypted (starts with U2F for AES)
 */
export const isEncrypted = (message) => {
    if (!message) return false;
    // AES encrypted strings typically start with 'U2F' in base64
    return message.startsWith('U2F');
};
