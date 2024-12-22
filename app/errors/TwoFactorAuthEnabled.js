module.exports = class TwoFactorAuthEnabledError extends Error {
    constructor() {
        super('Two factor authentication is enabled for this user');
        this.name = 'TwoFactorAuthEnabledError';
    }
} 