const ChargeRate = require('../../app/model/ChargeRate');

describe('ChargeRate', () => {
    let connection;
    beforeAll(async () => {
        connection = await require('../../app/config/database').connect('test-tax');
    });
    afterAll(async () => {
        await connection.disconnect();
    });

    afterEach(async () => {
        await ChargeRate.deleteMany();
    });

    it('should create a new tax rate', async () => {
        await ChargeRate.create({
            country: 'USA',
            state: 'Connecticut',
            city: 'Hartford',
            taxRate: 6.35,
            serviceFee: 0.10,
            
        });

        const chargeRate = await ChargeRate.findOne();
        expect(chargeRate).toBeDefined();
        expect(chargeRate.country).toBe('USA');
        expect(chargeRate.state).toBe('Connecticut');
        expect(chargeRate.city).toBe('Hartford');
        expect(chargeRate.taxRate).toBe(6.35);
    });

});