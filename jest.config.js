module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__test__/**/*.test.ts'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/index.ts',
        '!src/app.ts',
        '!src/__test__/**',
    ],
    setupFilesAfterEnv: ['<rootDir>/src/__test__/setup.ts'],
    moduleNameMapper: {
        "^uuid$": "<rootDir>/src/__test__/__mocks__/uuid.js",
    },
};

