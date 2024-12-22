const { generateJwtToken, verify } = require("../../app/utils/jwt");
require('dotenv').config();

describe('jwt', () => {
    it('should generate a token', () => {
        const token = generateJwtToken({
            id: '123',
            role: 'admin'
        });
        expect(token).toBeTruthy();

    });

    it('should verify a token', () => {
        const token = generateJwtToken({
            id: '123',
            role: 'admin'
        });
        const decoded = verify(token);
        expect(decoded).toEqual(expect.objectContaining({
            id: '123',
            role: 'admin'
        }));
    });

    it('should throw an error if the token is invalid', () => {
        expect(() => verify('invalid-token')).toThrow('jwt malformed');
    });

    it('should throw an error if the token is expired', () => {
        const token = generateJwtToken({
            id: '123',
            role: 'admin'
        }, { expiresIn: '1ms' });
        expect(() => verify(token)).toThrow('jwt expired');
    });
});
