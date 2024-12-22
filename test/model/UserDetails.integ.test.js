const UserDetails = require('../../app/model/UserDetails');
const User = require('../../app/model/User');
const { connect } = require('../../app/config/database');

describe('Model: UserDetails', () => {
    let connection;
    beforeAll(async () => {
        connection = await connect('test-db-xdxd');
        await UserDetails.deleteMany();
    });
    afterAll(async () => {
        await connection.disconnect();
    });

    beforeEach(async () => {
        await UserDetails.deleteMany({});
    });

    it('should create userinfo for user', async () => {
        const user = new User();
        const doc = {
            salutation: 'Mr',
            firstName: 'test',
            lastName: 'test',
            phone: '1234567899',
            address: 'address',
            state: 'state',
            zip: 123456,
            city: 'WB',
            country: 'India',
            user: user._id
        };
        await UserDetails.create(doc);
        const foundUserDetails = await UserDetails.findOne({ user: user._id });
        expect(foundUserDetails).toBeTruthy();
        expect(foundUserDetails.firstName).toBe(doc.firstName);
        expect(foundUserDetails.lastName).toBe(doc.lastName);
        expect(foundUserDetails.salutation).toBe(doc.salutation);
        expect(foundUserDetails.phone).toBe(+doc.phone);
        expect(foundUserDetails.address).toBe(doc.address);
        expect(foundUserDetails.state).toBe(doc.state);
        expect(foundUserDetails.zip).toBe(doc.zip);
        expect(foundUserDetails.city).toBe(doc.city);
        expect(foundUserDetails.country).toBe(doc.country);
        expect(foundUserDetails.user._id.toString()).toBe(doc.user.toString());
    });
});