module.exports = {
  'moduleFileExtensions': [
    'ts',
    'tsx',
    'js'
  ],
  'preset': 'ts-jest',
  'testMatch': [
    '**/src/tests/integration/**/*.spec.(ts|tsx|js)'
  ],
  'verbose': true,
  'testEnvironment': '<rootDir>/src/tests/integration/helper/test-environment.js',
  'reporters': ['default']
};
