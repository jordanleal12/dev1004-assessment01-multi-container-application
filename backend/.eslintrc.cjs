module.exports = {
  root: true,
  env: { node: true, es2023: true },
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  rules: {
    // Add project-specific overrides here when needed
  },
  ignorePatterns: ['dist/', 'coverage/', 'node_modules/'],
};
