//@ts-check

const Amenity = require('./model/Amenity');
const Category = require('./model/Category');
const ChargeRate = require('./model/ChargeRate');
const { Grant, resources, typeResource } = require('./model/Grant');
const { AccessControl } = require('accesscontrol');
const User = require('./model/User');


/** @type {'create:any' | 'create:own' | 'read:any' | 'read:own' | 'update:any' | 'update:own' | 'delete:any' | 'delete:own'} */
let typePermission;

/** @type {{[key: string]: Partial<{[key in typeResource]: Partial<{[key in typeof typePermission]: Array<String>}>}>}} */
const grants = {
    owner: {
        cancelation: {
            'create:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*'],
            'delete:any': ['*'],
        },
        user: {
            'create:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*'],
            'delete:any': ['*'],
        },
        category: {
            'create:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*'],
            'delete:any': ['*'],
        },
        grant: {
            'create:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*'],
            'delete:any': ['*'],
        },
        review: {
            'create:any': ['*'],
            'read:any': ['*'],
            'delete:any': ['*'],
            'update:any': ['*'],
        },
        support: {
            'create:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*'],
            'delete:any': ['*'],
        },
        notification: {
            'create:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*'],
            'delete:any': ['*'],
        },
        report: {
            'create:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*'],
            'delete:any': ['*'],
        },
        chargeRate: {
            'create:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*'],
            'delete:any': ['*'],
        },
        banner: {
            'create:any': ['*'],
            'read:any': ['*'],
            'delete:any': ['*'],
            'update:any': ['*'],
        },
        amenity: {
            'create:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*'],
            'delete:any': ['*'],
        },
        userDetails: {
            'create:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*'],
            'delete:any': ['*'],
        },
        bankAccount: {
            'create:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*'],
            'delete:any': ['*'],
        },
        product: {
            'create:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*'],
            'delete:any': ['*'],
        },
        "product/images": {
            "read:any": ['*'],
        },
        "product/docs": {
            "read:any": ['*'],
        },
        order: {
            'create:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*'],
            'delete:any': ['*'],
        },
        "order/config": {
            'create:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*'],
            'delete:any': ['*'],
        },
        payout: {
            'create:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*'],
            'delete:any': ['*'],
        },
        refund: {
            'create:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*'],
            'delete:any': ['*'],
        },
        ledger: {
            'create:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*'],
            'delete:any': ['*'],
        },
        chat: {
            'create:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*'],
            'delete:any': ['*'],
        },
        testimonial: {
            'create:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*'],
            'delete:any': ['*'],
        },
        dashboard: {
            'create:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*'],
            'delete:any': ['*'],
        },
        geo: {
            'create:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*'],
            'delete:any': ['*'],
        },
        discount: {
            'create:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*'],
            'delete:any': ['*'],
        },
        intro: {
            "read:any": ['*'],
        },
        feature: {
            'create:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*'],
            'delete:any': ['*'],
        }
    },
    user: {
        cancelation: {
            'create:own': ['*'],
            'read:own': ['*'],
        },
        user: {
            'read:own': ['*'],
            'update:own': ['*', '!disabled', '!verified', '!role', 'role.user', 'role.host'],
            'delete:own': ['*'],
        },
        category: {
            'read:any': ['*'],
        },
        review: {
            'create:own': ['*', '!user', '!approved'],
            'read:own': [
                'target',
                'comment',
                'rating',
                'user.name',
                'createdAt',
            ],
            'delete:own': ['*'],
            'update:own': ['*', '!user', '!approved'],
        },
        support: {
            'create:own': ['*', '!user', '!priority', '!status'],
            'read:own': ['*', '!priority'],
            'update:own': ['title', 'reference', 'description',],
            'delete:own': ['*'],
        },
        notification: {
            'read:own': ['*'],
            'update:own': ['read'],
        },
        report: {
            'create:own': [
                "*",
                '!reportedBy',
                '!status',
                '!rejectedReason',
            ],
            'read:own': ['*'],
        },
        chargeRate: {
            'read:any': ['*', '!_id', '!__v', '!createdAt', '!updatedAt'],
        },
        cart: {
            'create:own': ['*'],
            'read:own': ['*'],
            'update:own': ['*'],
            'delete:own': ['*'],
        },
        banner: {
            'read:any': ['*'],
        },
        amenity: {
            'read:any': ['*'],
        },
        userDetails: {
            'read:own': ['*'],
            'update:own': ['*', '!user'],
            'delete:own': ['*'],
        },
        bankAccount: {
            'create:own': ['*'],
            'read:own': ['*'],
            'update:own': ['*', '!user'],
            'delete:own': ['*'],
        },
        product: {
            "read:any": [
                'average_rating',
                'review_count',
                'name',
                'price',
                'description',
                'category',
                'images',
                'sort',
                'categories',
                'amenities',
                'owner.name',
                'owner.profilePic',
                'owner._id',
                'availability',
                '_id',
                'id',
                'location',
                'orders',
                'maxCapacity',

            ],
            "read:own": [] // No one can read own
        },
        geo: {
            'read:any': ['*'],
        },
        "product/images": {
            "read:any": ['*'],
        },
        checkout: {
            'create:own': ['*'],
            'read:own': ['*'],
            'update:own': ['*'],
            'delete:own': ['*'],
        },
        chat: {
            'create:own': ['*'],
            'read:own': ['*'],
            'update:own': ['*'],
            'delete:own': ['*'],
        },
        order: {
            'read:own': ['*'],
        },
        testimonial: {
            "read:any": ['*'],
        },
        discount: {
            'read:any': ['*'],
        },
        intro: {
            "read:any": ['*'],
        },
        feature: {
            'read:any': [
                'average_rating',
                'review_count',
                'name',
                'price',
                'description',
                'category',
                'images',
                'sort',
                'categories',
                'amenities',
                'owner.name',
                'owner.profilePic',
                'owner._id',
                'availability',
                '_id',
                'id',
                'location',
                'maxCapacity',
            ],
        },
    },
    host: {
        cancelation: {
            'create:own': ['*'],
            'read:own': ['*'],
        },
        user: {
            'read:own': ['*'],
            'update:own': ['*', '!disabled', '!verified', '!role', 'role.user', 'role.host'],
            'delete:own': ['*'],
        },
        category: {
            'read:any': ['*'],
        },
        review: {
            'read:any': ['*', 'user.name'],
        },
        support: {
            'create:own': ['*', '!user', '!priority', '!status'],
            'read:own': ['*', '!priority'],
            'update:own': ['title', 'reference', 'description',],
            'delete:own': ['*'],
        },
        notification: {
            'read:own': ['*'],
            'update:own': ['read'],
        },
        report: {
            'create:own': [
                "*",
                '!reportedBy',
                '!status',
                '!rejectedReason',
            ],
            'read:own': ['*'],
        },
        chargeRate: {
            'read:any': ['*', '!_id', '!__v', '!createdAt', '!updatedAt'],
        },
        banner: {
            'read:any': ['*'],
        },
        amenity: {
            'read:any': ['*'],
        },
        userDetails: {
            'read:own': ['*'],
            'update:own': ['*', '!user'],
            'delete:own': ['*'],
        },
        bankAccount: {
            'create:own': ['*'],
            'read:own': ['*'],
            'update:own': ['*', '!user'],
            'delete:own': ['*'],
        },
        geo: {
            'read:any': ['*'],
        },
        product: {
            "create:own": [
                '*',
                '!owner',
                '!verified',
            ],
            "read:own": ['*'],
            "update:own": [
                '*',
                '!owner',
                '!verified',
            ],
            "delete:own": ['*'],
        },
        "product/images": {
            "read:any": ['*'],
        },
        "product/docs": {
            "read:own": ['*'],
        },
        order: {
            'read:own': ['*'],
        },
        "order/config": {
            "read:own": ['*'],
            "update:own": [
                '*',
                '!user',
                'blocked',
            ]
        },
        payout: {
            "read:own": ['*'],
        },
        chat: {
            'create:own': ['*'],
            'read:own': ['*'],
        },
        testimonial: {
            "read:any": ['*'],
        },
        intro: {
            "read:own": ['*'],
            "update:own": ['*'],
        },
        feature: {
            'read:any': [
                'average_rating',
                'review_count',
                'name',
                'price',
                'description',
                'category',
                'images',
                'sort',
                'categories',
                'amenities',
                'owner.name',
                'owner.profilePic',
                'owner._id',
                'availability',
                '_id',
                'id',
                'location',
                'maxCapacity',
            ],
        },
    },
    anonymous: {
        product: {
            "read:any": [
                'average_rating',
                'review_count',
                'name',
                'price',
                'description',
                'category',
                'images',
                'sort',
                'categories',
                'amenities',
                'owner.name',
                'owner.profilePic',
                'owner._id',
                'availability',
                '_id',
                'id',
                'location',
                'maxCapacity',


            ],
            "read:own": [] // No one can read own
        },
        user: {
            "create:any": [
                'name',
                'email',
                'password',
                'role.user',
                'role.host',
            ],
        },
        "product/images": {
            "read:any": ['*'],
        },
        chargeRate: {
            'read:any': ['*', '!_id', '!__v', '!createdAt', '!updatedAt'],
        },
        testimonial: {
            "read:any": ['*'],
        },
        category: {
            'read:any': ['*'],
        },
        amenity: {
            'read:any': ['*'],
        },
        banner: {
            'read:any': ['*'],
        },
        intro: {
            "read:any": ['*'],
        },
        feature: {
            'read:any': [
                'average_rating',
                'review_count',
                'name',
                'price',
                'description',
                'category',
                'images',
                'sort',
                'categories',
                'amenities',
                'owner.name',
                'owner.profilePic',
                'owner._id',
                'availability',
                '_id',
                'id',
                'location',
                'maxCapacity',
            ],
        },

    },
    robot: {
        support: {
            "create:any": ['*'],
            "delete:any": ['*'],
            "read:any": ['*'],
            "update:any": ['*'],
            "create:own": ['*'],
            "delete:own": ['*'],
            "read:own": ['*'],
            "update:own": ['*'],
        }
    }
};

const seedGrants = async () => {

    const _grants = Object.entries(grants).map(([role, resources]) => {
        return Object.entries(resources).map(([resource, permissions]) => {
            return Object.entries(permissions).map(([permission, attributes]) => {
                return {
                    role,
                    resource,
                    action: permission.split(':')[0],
                    possession: permission.split(':')[1] ?? 'any',
                    attributes,
                };
            });
        }).flat();
    }).flat();

    await Grant.deleteMany({ role: { $in: Object.keys(grants) } });
    await Grant.insertMany(_grants);
};
const seedTaxAndServiceCharge = async () => {
    const raw = {
        "state": "Connecticut",
        "cities": [
            "Andover",
            "Ansonia",
            "Ashford",
            "Avon",
            "Barkhamsted",
            "Beacon Falls",
            "Berlin",
            "Bethany",
            "Bethel",
            "Bethlehem",
            "Bloomfield",
            "Bolton",
            "Bozrah",
            "Branford",
            "Bridgeport",
            "Bridgewater",
            "Bristol",
            "Brookfield",
            "Brooklyn",
            "Burlington",
            "Canaan",
            "Canterbury",
            "Canton",
            "Chaplin",
            "Cheshire",
            "Chester",
            "Clinton",
            "Colchester",
            "Colebrook",
            "Columbia",
            "Cornwall",
            "Coventry",
            "Cromwell",
            "Danbury",
            "Darien",
            "Deep River",
            "Derby",
            "Durham",
            "East Granby",
            "East Haddam",
            "East Hampton",
            "East Hartford",
            "East Haven",
            "East Lyme",
            "East Windsor",
            "Eastford",
            "Easton",
            "Ellington",
            "Enfield",
            "Essex",
            "Fairfield",
            "Farmington",
            "Franklin",
            "Glastonbury",
            "Goshen",
            "Granby",
            "Greenwich",
            "Griswold",
            "Groton",
            "Guilford",
            "Haddam",
            "Hamden",
            "Hampton",
            "Hartford",
            "Hartland",
            "Harwinton",
            "Hebron",
            "Kent",
            "Killingly",
            "Killingworth",
            "Lebanon",
            "Ledyard",
            "Lisbon",
            "Litchfield",
            "Lyme",
            "Madison",
            "Manchester",
            "Mansfield",
            "Marlborough",
            "Meriden",
            "Middlebury",
            "Middlefield",
            "Middletown",
            "Milford",
            "Monroe",
            "Montville",
            "Morris",
            "Naugatuck",
            "Newington",
            "Newtown",
            "New Britain",
            "New Canaan",
            "New Fairfield",
            "New Hartford",
            "New Haven",
            "New London",
            "New Milford",
            "Norfolk",
            "North Branford",
            "North Canaan",
            "North Haven",
            "North Stonington",
            "Norwalk",
            "Norwich",
            "Old Lyme",
            "Old Saybrook",
            "Orange",
            "Oxford",
            "Plainfield",
            "Plainville",
            "Plymouth",
            "Pomfret",
            "Portland",
            "Preston",
            "Prospect",
            "Putnam",
            "Redding",
            "Ridgefield",
            "Rocky Hill",
            "Roxbury",
            "Salem",
            "Salisbury",
            "Scotland",
            "Seymour",
            "Sharon",
            "Shelton",
            "Sherman",
            "Simsbury",
            "Somers",
            "South Windsor",
            "Southbury",
            "Southington",
            "Sprague",
            "Stafford",
            "Stamford",
            "Sterling",
            "Stonington",
            "Stratford",
            "Suffield",
            "Thomaston",
            "Thompson",
            "Tolland",
            "Torrington",
            "Trumbull",
            "Union",
            "Vernon",
            "Voluntown",
            "Wallingford",
            "Warren",
            "Washington",
            "Waterbury",
            "Waterford",
            "Watertown",
            "West Hartford",
            "West Haven",
            "Westbrook",
            "Weston",
            "Westport",
            "Wethersfield",
            "Willington",
            "Wilton",
            "Winchester",
            "Windham",
            "Windsor",
            "Windsor Locks",
            "Wolcott",
            "Woodbridge",
            "Woodbury",
            "Woodstock"
        ]
    };

    const taxAndServiceCharge = raw.cities.map(city => {
        return {
            country: 'United States',
            city: city,
            state: raw.state,
            serviceFee: 10,
            taxRate: 6.35,
        };

    });

    await ChargeRate.deleteMany({});
    await ChargeRate.insertMany(taxAndServiceCharge);
};

const seedAmenities = async () => {
    const data = [{
        "_id": {
            "$oid": "64d76d47d5eba78d7aaf7337"
        },
        "isChecked": false,
        "amenityName": "Fire Pit",
        "amenityIcon": "/uploads/Amenities_categories/Fire Pit.svg",
        "__v": 0
    },
    {
        "_id": {
            "$oid": "64d76d47d5eba78d7aaf733d"
        },
        "isChecked": false,
        "amenityName": "Restroom",
        "amenityIcon": "/uploads/Amenities_categories/Restroom.svg",
        "__v": 0
    },
    {
        "_id": {
            "$oid": "64d76d47d5eba78d7aaf7341"
        },
        "isChecked": false,
        "amenityName": "Wifi",
        "amenityIcon": "/uploads/Amenities_categories/Wifi.svg",
        "__v": 0
    },
    {
        "_id": {
            "$oid": "64d76d47d5eba78d7aaf7343"
        },
        "isChecked": false,
        "amenityName": "Parking",
        "amenityIcon": "/uploads/Amenities_categories/Parking.svg",
        "__v": 0
    },
    {
        "_id": {
            "$oid": "64d76d47d5eba78d7aaf733a"
        },
        "isChecked": false,
        "amenityName": "Gazeboo",
        "amenityIcon": "/uploads/Amenities_categories/Gazebo.svg",
        "__v": 0
    },
    {
        "_id": {
            "$oid": "64d76d47d5eba78d7aaf733c"
        },
        "isChecked": false,
        "amenityName": "Hot Tub",
        "amenityIcon": "/uploads/Amenities_categories/Hot Tub.svg",
        "__v": 0
    },
    {
        "_id": {
            "$oid": "64d76d47d5eba78d7aaf733f"
        },
        "isChecked": false,
        "amenityName": "Jacuzzi",
        "amenityIcon": "/uploads/Amenities_categories/Jacuzee.svg",
        "__v": 0
    },
    {
        "_id": {
            "$oid": "64d76d47d5eba78d7aaf7340"
        },
        "isChecked": false,
        "amenityName": "Noise Friendly",
        "amenityIcon": "/uploads/Amenities_categories/Noice Friendly.svg",
        "__v": 0
    },
    {
        "_id": {
            "$oid": "64d76d47d5eba78d7aaf7342"
        },
        "isChecked": false,
        "amenityName": "Chairs & Tables",
        "amenityIcon": "/uploads/Amenities_categories/Table Chair.svg",
        "__v": 0
    },
    {
        "_id": {
            "$oid": "64d76d47d5eba78d7aaf7344"
        },
        "isChecked": false,
        "amenityName": "Tables",
        "amenityIcon": "/uploads/Amenities_categories/Table.svg",
        "__v": 0
    },
    {
        "_id": {
            "$oid": "64d76d47d5eba78d7aaf7345"
        },
        "isChecked": false,
        "amenityName": "Chairs",
        "amenityIcon": "/uploads/Amenities_categories/Chair.svg",
        "__v": 0
    },
    {
        "_id": {
            "$oid": "64d76d47d5eba78d7aaf7338"
        },
        "isChecked": false,
        "amenityName": "Deck",
        "amenityIcon": "/uploads/Amenities_categories/Deck.svg",
        "__v": 0
    },
    {
        "_id": {
            "$oid": "64d76d47d5eba78d7aaf7339"
        },
        "isChecked": false,
        "amenityName": "Pool",
        "amenityIcon": "/uploads/Amenities_categories/Pool.svg",
        "__v": 0
    },
    {
        "_id": {
            "$oid": "64d76d47d5eba78d7aaf733b"
        },
        "isChecked": false,
        "amenityName": "Grill",
        "amenityIcon": "/uploads/Amenities_categories/Grill.svg",
        "__v": 0
    },
    {
        "_id": {
            "$oid": "64d76d47d5eba78d7aaf733e"
        },
        "isChecked": false,
        "amenityName": "Pet Friendly",
        "amenityIcon": "/uploads/Amenities_categories/Pet Friendly.svg",
        "__v": 0
    }];

    await Amenity.deleteMany({});
    const mappedData = data.map(amenity => {
        const baseFileName = amenity.amenityIcon.split('/').pop();
        return new Amenity({
            _id: amenity._id.$oid,
            name: amenity.amenityName,
            image: baseFileName,
        });

    });

    await Amenity.create(mappedData);
};

const seedCategories = async () => {
    const data = [{
        "_id": {
            "$oid": "64d76cc1bd20601e88854f70"
        },
        "isChecked": false,
        "categoryName": "Party",
        "categoryIcon": "/uploads/Amenities_categories/Party.svg",
        "categoryImage": "/uploads/home/Party.png",
        "__v": 0
    },
    {
        "_id": {
            "$oid": "64d76cc1bd20601e88854f6f"
        },
        "isChecked": false,
        "categoryName": "Wedding Reception",
        "categoryIcon": "/uploads/Amenities_categories/wedding Reception.svg",
        "categoryImage": "/uploads/home/Wedding Reception.png",
        "__v": 0
    },
    {
        "_id": {
            "$oid": "64d76cc1bd20601e88854f6c"
        },
        "isChecked": false,
        "categoryName": "Barbeque",
        "categoryIcon": "/uploads/Amenities_categories/Barbeque.svg",
        "categoryImage": "/uploads/home/Barbecue.png",
        "__v": 0
    },
    {
        "_id": {
            "$oid": "64d76cc1bd20601e88854f6d"
        },
        "isChecked": false,
        "categoryName": "Picnic",
        "categoryIcon": "/uploads/Amenities_categories/PIcnic.svg",
        "categoryImage": "/uploads/home/Picnic.png",
        "__v": 0
    },
    {
        "_id": {
            "$oid": "64d76cc1bd20601e88854f72"
        },
        "isChecked": false,
        "categoryName": "Baby Shower",
        "categoryIcon": "/uploads/Amenities_categories/Baby Shower.svg",
        "categoryImage": "/uploads/home/Baby shower.png",
        "__v": 0
    },
    {
        "_id": {
            "$oid": "64d76cc1bd20601e88854f77"
        },
        "isChecked": false,
        "categoryName": "Gyms",
        "categoryIcon": "/uploads/Amenities_categories/Gym.svg",
        "categoryImage": "/uploads/home/Gym.png",
        "__v": 0
    },
    {
        "_id": {
            "$oid": "64d76cc1bd20601e88854f7b"
        },
        "isChecked": false,
        "categoryName": "Video Shoot",
        "categoryIcon": "/uploads/Amenities_categories/Videoshoot.svg",
        "categoryImage": "/uploads/home/Video shoot.png",
        "__v": 0
    },
    {
        "_id": {
            "$oid": "64d76cc1bd20601e88854f7a"
        },
        "isChecked": false,
        "categoryName": "Wellness",
        "categoryIcon": "/uploads/Amenities_categories/Wllness.svg",
        "categoryImage": "/uploads/home/wellness.png",
        "__v": 0
    },
    {
        "_id": {
            "$oid": "64d76cc1bd20601e88854f73"
        },
        "isChecked": false,
        "categoryName": "Birthday Party",
        "categoryIcon": "/uploads/Amenities_categories/Birthday party.svg",
        "categoryImage": "/uploads/home/BIrthday.png",
        "__v": 0
    },
    {
        "_id": {
            "$oid": "64d76cc1bd20601e88854f74"
        },
        "isChecked": false,
        "categoryName": "Engagement Party",
        "categoryIcon": "/uploads/Amenities_categories/engagement Party.svg",
        "categoryImage": "/uploads/home/Engagement party.png",
        "__v": 0
    },
    {
        "_id": {
            "$oid": "64d76cc1bd20601e88854f75"
        },
        "isChecked": false,
        "categoryName": "OutDoor Dinner",
        "categoryIcon": "/uploads/Amenities_categories/Outdoror Dinner.svg",
        "categoryImage": "/uploads/home/outdoor  dinner.png",
        "__v": 0
    },
    {
        "_id": {
            "$oid": "64d76cc1bd20601e88854f76"
        },
        "isChecked": false,
        "categoryName": "Bridal Shower",
        "categoryIcon": "/uploads/Amenities_categories/Bridal shower.svg",
        "categoryImage": "/uploads/home/Bridal shower.png",
        "__v": 0
    },
    {
        "_id": {
            "$oid": "64d76cc1bd20601e88854f6e"
        },
        "isChecked": false,
        "categoryName": "Wedding",
        "categoryIcon": "/uploads/Amenities_categories/Wedding.svg",
        "categoryImage": "/uploads/home/Wedding.png",
        "__v": 0
    },
    {
        "_id": {
            "$oid": "64d76cc1bd20601e88854f71"
        },
        "isChecked": false,
        "categoryName": "Graduation Party",
        "categoryIcon": "/uploads/Amenities_categories/Graduation Party.svg",
        "categoryImage": "/uploads/home/Grad Party.png",
        "__v": 0
    },
    {
        "_id": {
            "$oid": "64d76cc1bd20601e88854f78"
        },
        "isChecked": false,
        "categoryName": "Gathering",
        "categoryIcon": "/uploads/Amenities_categories/Gathering.svg",
        "categoryImage": "/uploads/home/Gathering.png",
        "__v": 0
    },
    {
        "_id": {
            "$oid": "64d76cc1bd20601e88854f79"
        },
        "isChecked": false,
        "categoryName": "Fundraiser",
        "categoryIcon": "/uploads/Amenities_categories/Fundraiser.svg",
        "categoryImage": "/uploads/home/Fundraisers.png",
        "__v": 0
    }];

    await Category.deleteMany({});
    const mappedData = data.map(category => {
        const baseIconFileName = category.categoryIcon.split('/').pop();
        const baseImageFileName = category.categoryImage.split('/').pop();
        return new Category({
            _id: category._id.$oid,
            name: category.categoryName,
            image: baseIconFileName,
            banner: baseImageFileName,
        });

    });
    await Category.create(mappedData);

};

const seedUsers = async () => {
    const debug = require('debug')('app:seed:seedUsers');

    const robot = await User.findOneAndUpdate({ email: 'robot@test.com' }, {
        name: 'robot',
        email: 'robot@test.com',
        password: 'robot',
        role: 'robot',
        twoFactorAuthEnabled: true,
        verified: true,
    }, { upsert: true, new: true })

    // @ts-ignore
    debug({ 'robot token': robot.generateToken({ 'expiresIn': '1 Year' }) })


    const users = [
        new User({
            name: 'owner',
            email: 'owner@test.com',
            password: 'owner',
            role: 'owner',
            verified: true,
        }),
        new User({
            name: 'user',
            email: 'user@test.com',
            password: 'user',
            role: 'user',
            verified: true,
        }),
        new User({
            name: 'host',
            email: 'host@test.com',
            password: 'host',
            role: 'host',
            verified: true,
        }),
        new User({
            name: 'host',
            email: 'test@test.com',
            password: 'host',
            role: 'host',
            twoFactorAuthEnabled: true,
            verified: true,
        }),
    ];

    await Promise.all(users.map(u => u.save().catch(_ => null)));
};


async function seed() {
    const debug = require('debug')('app:seed');
    require('dotenv').config();
    let connection = await require('./config/database').connect();
    debug('Seeding database...');
    await seedGrants();
    debug('Grants seeded');
    await seedTaxAndServiceCharge();
    debug('Tax and Service Charge seeded');
    await seedAmenities();
    debug('Amenities seeded');
    await seedCategories();
    debug('Categories seeded');
    await seedUsers();
    debug('Users seeded');

    await connection.disconnect();
}


if (process.env.NODE_ENV !== 'test') {
    seed();
}

module.exports = process.env.NODE_ENV === 'test' ? {
    seedGrants,
    grants,
} : undefined;