/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier',
    'nrz',
  ],
  plugins: ['@typescript-eslint/eslint-plugin'],
  parser: '@typescript-eslint/parser',
  ignorePatterns: [
    '.*.js',
    '*.setup.js',
    '*.config.js',
    '.nrz/',
    'dist/',
    'coverage/',
    'node_modules/',
  ],
};
