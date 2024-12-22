const nodemailer = require("nodemailer");

let config = {
    host: "mail.appispot.com",
    port: 587,
    secure: false,
    tls: {
        ciphers: "SSLv3",
    },

};


function createTransport({ user, pass }) {
    return nodemailer.createTransport({
        ...config,
        pool: true,
        auth: {
            user,
            pass,
        }
    }, { from: user })
}

const verify = createTransport({
    user: "verify@appispot.com",
    pass: "&,GhtmAn,23",
})
const support = createTransport({
    user: "support@appispot.com",
    pass: "52,{,ReVRos",
})

module.exports = {
    verify,
    support,
};
