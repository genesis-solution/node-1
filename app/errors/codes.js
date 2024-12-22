module.exports = {
    // auth
    'INVALID_EMAIL_PASSWORD': { code: 'INVALID_EMAIL_PASSWORD', message: 'Invalid email or password' },
    '2FA_ENABLED': { code: '2FA_ENABLED', message: 'Two factor authentication is enabled' },
    'ACCOUNT_DISABLED': { code: 'ACCOUNT_DISABLED', message: 'Account is Disabled' },
    ACCOUNT_NOT_VERIFIED: { code: 'ACCOUNT_NOT_VERIFIED', message: 'Account is not verified' },
    FORBIDDEN: { code: 'FORBIDDEN', message: 'Forbidden' },

    // Product
    PRODUCT_NOT_FOUND: { code: 'PRODUCT_NOT_FOUND', message: 'Product not found' },

    //Review
    REVIEW_NOT_FOUND: { code: 'REVIEW_NOT_FOUND', message: 'Review not found' },

    // Support
    SUPPORT_NOT_FOUND: { code: 'SUPPORT_NOT_FOUND', message: 'Case not found' },

    // Checkout
    CHECKOUT_USER_NOT_FOUND: { code: 'CHECKOUT_USER_NOT_FOUND', message: 'User not found' },
    CHECKOUT_INVALID_DISCOUNT: { code: 'CHECKOUT_INVALID_DISCOUNT', message: 'Invalid discount' },
    CHECKOUT_PRODUCT_NOT_FOUND: { code: 'CHECKOUT_PRODUCT_NOT_FOUND', message: 'Product not found' },
    CHECKOUT_INVALID_RENT_DURATION: { code: 'CHECKOUT_INVALID_RENT_DURATION', message: 'Rent duration must be more than 1 hour' },
    CHECKOUT_PRODUCT_MAX_CAPACITY: { code: 'CHECKOUT_PRODUCT_MAX_CAPACITY', message: 'Product guests has reached maximum capacity' },
    // Discount
    DISCOUNT_NOT_FOUND: { code: 'DISCOUNT_NOT_FOUND', message: 'Discount not found' },

    // General
    BAD_REQUEST: { code: 'BAD_REQUEST', message: 'Invalid Request Body' },
    INTERNAL_SERVER_ERROR: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' },
    NOT_FOUND: { code: 'NOT_FOUND', message: 'Resource not found' },
    // TODO: add more error codes
};