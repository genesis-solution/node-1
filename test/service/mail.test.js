const mailService = require('../../app/service/mail');

describe('Mail Service', () => {
    describe('sendVerificationEmail', () => {
        it('should send a verification email', async () => {
            const email = 'test@test.com';

            const result = await mailService.sendEmailVerification(email, 'test');
            expect(result.accepted).toContain(email);
            console.log(result);
        });
    });
    describe('sendForgotPasswordEmail', () => {
        it('should send a forgot password email', async () => {
            const email = 'test@test.com';

            const result = await mailService.sendEmailForgotPassword(email, 'test');
            expect(result.accepted).toContain(email);
            console.log(result);
        });
    });
    describe('send2FAEmail', () => {
        it('should send a 2FA email', async () => {
            const email = 'test@test.com';

            const result = await mailService.sendEmail2FA(email, 'test', 'test');
            expect(result.accepted).toContain(email);
            console.log(result);
        });

    });

});
