const mongoose = require('mongoose');

const BankAccountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    nameOnAccount: String,
    bankAccountNumber: String,
    bankName: String,
    address: {
        email: String,
        phone: String,
        salutation: String,
        firstName: String,
        lastName: String,
        address: String,
        country: {
            type: String,
            default: "United States of America"
        },
        city: String,
        state: String,
        zip: String
    },
});

const BankAccount = mongoose.model('BankAccount', BankAccountSchema);
module.exports = BankAccount;
