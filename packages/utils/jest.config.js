const baseConfig = require('../../jest.config');

/** @type {import('jest').Config} */
module.exports = {
  ...baseConfig,
  displayName: '@knowledge-hub/utils',
  rootDir: './',
  testMatch: ['<rootDir>/src/**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/src/**/__tests__/**',
  ],
};
