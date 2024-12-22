const transporter = require("../../config/mailer");

module.exports = {
    async send(email) {
        const mailOptions = {

            to: email,
            subject: 'You received a message',
            html: '<p>You reveived a new message</p>',
        };
        return await transporter.support.sendMail(mailOptions);
    }
};