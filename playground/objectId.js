const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");


const objid = new ObjectId();

const objid1 = new ObjectId(objid);
const objid2 = new ObjectId(objid);

const objid3 = new mongoose.Types.ObjectId(objid);
const objid4 = new mongoose.Types.ObjectId(objid);

console.log(objid === objid1); // false

console.log(objid1.equals(objid2)); // true

console.log(objid1 === objid2); // false

console.log([objid1, objid2].includes(objid)); // false

console.log([objid1, objid2].some(id => id.equals(objid))); // true


console.log(objid3.equals(objid4)); // true