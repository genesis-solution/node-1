const { Notation } = require('notation/lib/notation');
const mongoose = require('mongoose');

const obj = {
    nested: Object.create(null),
    array: [
        {
            key: 'value'
        }
    ],
    roles: {
        admin: 'admin',
        user: 'user',
        guest: 'guest'
    },
    test: 'admin'
};
obj.nested.key = 'value';
console.log(obj);
console.log(Notation);
const notate = Notation.create(obj);
// console.log(notate.filter(['*', `roles.admin`, 'test[0]']).value);
// console.log(notate.filter(['test["a"]']).value);
// console.log(notate.set('role.admin', 'superadmin').value);
console.log(notate.filter(['!test.admin']).value);

const taxs = [{
    _id: new mongoose.Types.ObjectId(),
    country: 'USA',
    state: 'Connecticut',
    cities: [
        {
            name: 'Hartford',
            taxRate: 6.35,
            serviceFee: 0.5
        },
        {
            name: 'New Haven',
            taxRate: 6.35,
            serviceFee: 0.5
        }
    ],
}];

const taxNotation = Notation.create(taxs);
console.log(JSON.stringify(taxNotation.filter('_').value));