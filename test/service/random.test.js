const service = require('../../app/service/random');

describe('Service: Random', () => {
    describe('randomHex', () => {
        it('should return a random hex string', () => {
            const hex = service.randomHex();
            expect(hex).toMatch(/^[0-9a-f]+$/);
        });
        it('should return a random hex string with the specified length', () => {
            const length = 32;
            const hex = service.randomHex(length);
            expect(hex).toHaveLength(length*2);
        });
        it('should return a random hex string with the specified length', () => {
            const length = 64;
            const hex = service.randomHex(length);
            expect(hex).toHaveLength(length*2);
        });
    });
});