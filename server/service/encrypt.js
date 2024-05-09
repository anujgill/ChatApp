const crypto = require('crypto');

function encryptMessage(message) {
    const cipher = crypto.createCipher('aes-256-cbc', process.env.SECRET_KEY);
    let encryptedMessage = cipher.update(message, 'utf8', 'hex');
    encryptedMessage += cipher.final('hex');
    return encryptedMessage;
}

function decryptMessage(encryptedMessage) {
    const decipher = crypto.createDecipher('aes-256-cbc', process.env.SECRET_KEY);
    let decryptedMessage = decipher.update(encryptedMessage, 'hex', 'utf8');
    decryptedMessage += decipher.final('utf8');
    return decryptedMessage;
}

module.exports = {
    encryptMessage,
    decryptMessage,
}