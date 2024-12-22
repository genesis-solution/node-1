const { AccessControl } = require('accesscontrol');
const Permission = require('accesscontrol/lib/core/Permission');
const mongoose = require('mongoose');

const ac = new AccessControl();

// ac.grant('user').createAny('a', ['*']);
// ac.grant('test').createOwn('a', ['*', '!b']);
// ac.grant('aaa').createOwn('a', []);

// console.log(ac.can('user').createOwn('a'));
// console.log(ac.can('user').createAny('a'));
// console.log(ac.can('aaa').createAny('a').granted);

// console.log(Permission.Permission.prototype)

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

// ac.grant('user').createAny('a', ['country']);
// ac.grant('user').createOwn('a', []);

// const createAny = ac.can('user').createAny('a')
// console.log(createAny.granted);
// const createOwn = ac.can('user').createOwn('a')
// console.log(createOwn.granted);

// ac.grant('user').createAny('a', ['country']);
// ac.grant('user').createAny('a', ['cities[*].name']);

// const createOwn = ac.can('user').createOwn('a')
// console.log(JSON.stringify(createOwn.filter(taxs), null, 2));

const data = {
    role: {
        user: true,
        admin: true,
    }
};

ac.grant('user').createAny('a', ['*', 'role.user', '!role']);
console.log(ac.can('user').createAny('a').filter(data));