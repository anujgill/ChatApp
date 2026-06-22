const crypto = require('crypto');

function getKey() {
  const secret = process.env.SECRET_KEY;
  if (!secret) {
    throw new Error("SECRET_KEY environment variable is missing! Please configure it in your .env file or environment settings.");
  }
  return crypto.createHash('sha256').update(secret).digest();
}

function encryptMessage(message) {
  try {
    const key = getKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(message, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error("Encryption error:", error);
    return message;
  }
}

function decryptMessage(encryptedMessage) {
  if (!encryptedMessage) return "";
  
  try {
    if (encryptedMessage.includes(":")) {
      const parts = encryptedMessage.split(":");
      if (parts.length === 2 && parts[0].length === 32) {
        const iv = Buffer.from(parts[0], 'hex');
        const ciphertext = parts[1];
        const key = getKey();
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        
        let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
      }
    }
  } catch (error) {
    console.error("Decryption failed:", error);
  }

  return encryptedMessage;
}

module.exports = {
  encryptMessage,
  decryptMessage,
}