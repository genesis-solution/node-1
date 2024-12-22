const crypto = require('crypto');

module.exports = {
    randomHex: (length = 16) => {
        return crypto.randomBytes(length).toString('hex');
    }
};
