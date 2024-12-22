module.exports = {
    setupFilesAfterEnv: ["<rootDir>/test/setup-jest.js"],
    globalSetup: "<rootDir>/test/jest/setup.js",
    globalTeardown: "<rootDir>/test/jest/teardown.js",
};