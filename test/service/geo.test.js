const { reverse } = require("../../app/service/geo");

describe('Service: Geo', () => {
    describe('reverse', () => {
        it('should return address', async () => {
            const result = await reverse({ latitude: 40.7831, longitude: -73.9712 });
            expect(result).toHaveProperty('address');
            expect(result).toHaveProperty('zipCode');
            expect(result).toHaveProperty('city');
            expect(result).toHaveProperty('road');
            expect(result).toHaveProperty('state');
            expect(result).toHaveProperty('country');
            // console.log(result);
        });
    });
});
