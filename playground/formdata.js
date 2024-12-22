const { toFormData } = require('axios');

console.log(toFormData({
    type: "fake account",
    description: "This account is fake",
    entity: {
        type: "User",
        entity: "60f3b4b8d9b9c5e1e9f2b8b4",
    },
    reportedBy: "60f3b4b8d9b9c5e1e9f2b8b4",
    status: undefined,
    rejectedReason: null,
    screenshots: [
        "fake-screenshot-1",
        "fake-screenshot-2",
    ],
}));