module.exports = {
  'moduleFileExtensions': [
    'ts',
    'tsx',
    'js'
  ],
  'preset': 'ts-jest',
  'testMatch': [
    '**/src/**/*.spec.ts',
    '!**/src/tests/**'
  ],
  'testEnvironment': 'node',
  'verbose': true,
  'reporters': ['default'],
  'collectCoverageFrom': [
    '**/src/server/**/*.ts',
    '!**/src/server/schema-validator/**/*.ts',
    '!**/src/server/queries/**/*.ts',
    '!**/db/**',
    '!**/node_modules/**'
  ],
  'coverageReporters': ['lcov', 'text']
};
