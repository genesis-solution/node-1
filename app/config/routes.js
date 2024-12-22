/**
 * Bind all routes to the app
 * @param {import("express").Express} app 
 */
module.exports = app => {
    app.use('/api/auth', require('../routes/auth'));
    app.use('/api/grants', require('../routes/grant'));
    app.use('/api/category', require('../routes/category'));
    app.use('/api/product', require('../routes/product'));
    app.use('/api/review', require('../routes/review'));
    app.use('/api/discount', require('../routes/discount'));
    app.use('/api/checkout', require('../routes/checkout'));
    app.use('/api/cancelation', require('../routes/cancelation'));
    app.use('/api/support', require('../routes/support'));
    app.use('/api/notifications', require('../routes/notification'));
    app.use('/api/report', require('../routes/report'));
    app.use('/api/chargeRate', require('../routes/chargeRate'));
    app.use('/api/cart', require('../routes/cart'));
    app.use('/api/banners', require('../routes/banner'));
    app.use('/api/amenities', require('../routes/amenity'));
    app.use('/api/userdetails', require('../routes/userdetails'));
    app.use('/api/bankAccount', require('../routes/BankAccount'));
    app.use('/api/geo', require('../routes/geo'));
    app.use('/api/chat', require('../routes/chat'));
    app.use('/api/orderConfig', require('../routes/orderConfig'));
    app.use('/api/order', require('../routes/order'));
    app.use('/api/payout', require('../routes/payout'));
    app.use('/api/refund', require('../routes/refund'));
    app.use('/api/ledger', require('../routes/ledger'));
    app.use('/api/testimonial', require('../routes/testimonial'));

    app.use('/api/dashboard', require('../routes/dashboard'));
    app.use('/api/intro', require('../routes/intro'));
    app.use('/api/featured', require('../routes/feature'));
};