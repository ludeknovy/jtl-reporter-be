module.exports = {
  'moduleFileExtensions': [
    'ts',
    'tsx',
    'js'
  ],
  'preset': 'ts-jest',
  'testMatch': [
    '**/src/tests/contract/**/*.spec.(ts|tsx|js)'
  ],
  'testEnvironment': 'node',
  'verbose': true,
  'reporters': ['default']
};
