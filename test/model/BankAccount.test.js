const BankAccount = require('../../app/model/BankAccount');
const mongoose = require('mongoose');
const { connect } = require('../../app/config/database');

describe('Model: BankAccount', () => {
    let connection;
    beforeAll(async () => {
        connection = await connect('bankaccoun-details-test');
    });

    afterAll(async () => {
        await connection.disconnect();
    });

    afterEach(async () => {
        await BankAccount.deleteMany({});
    });

    it('should create a bank account', async () => {
        const bankAccountData = {
            user: new mongoose.Types.ObjectId(),
            nameOnAccount: 'John Doe',
            bankAccountNumber: '1234567890',
            bankName: 'Test Bank',
            address: {
                email: 'john.doe@test.com',
                phone: '1234567890',
                salutation: 'Mr.',
                firstName: 'John',
                lastName: 'Doe',
                address: '123 Test Street',
                country: 'United States of America',
                city: 'Test City',
                state: 'Test State',
                zip: '12345',
            },
        };

        const bankAccount = await BankAccount.create(bankAccountData);

        expect(bankAccount).toBeDefined();
        expect(bankAccount.user).toEqual(bankAccountData.user);
        expect(bankAccount.nameOnAccount).toEqual(bankAccountData.nameOnAccount);
        expect(bankAccount.bankAccountNumber).toEqual(bankAccountData.bankAccountNumber);
        expect(bankAccount.bankName).toEqual(bankAccountData.bankName);
        expect(bankAccount.address).toEqual(bankAccountData.address);
    });
});