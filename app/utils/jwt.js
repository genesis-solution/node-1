const jwt = require('jsonwebtoken');
const debug = require('debug')('app:utils:jwt');

/**
 * Generates a jwt token
 * @param {{id: String, role: String} | object} payload
 * @param {jwt.SignOptions} options
 * @returns {String}
 */
const generateJwtToken = (payload, options = {}) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h', ...options });
};
/**
 * Verifies a token
 * @param {String} token 
 * @returns 
 */
const verify = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
    generateJwtToken,
    verify: verify
};
