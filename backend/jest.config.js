export default {
  // Specifies test environment will be node not browser
  testEnvironment: 'node',
  // Exclude node_modules from testing
  coveragePathIgnorePatterns: ['/node_modules/'],
  // Exclude specific test setup files from being treated as tests
  testPathIgnorePatterns: ['src/__tests__/setup/'],
  // Stops jest using transformers on JS files (e.g. Babel)
  transform: {},
  // Maps module paths to avoid issues with ES6 module imports
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
