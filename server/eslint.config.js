// eslint.config.js
import parser from '@typescript-eslint/parser';
import eslintPluginPrettier from 'eslint-plugin-prettier';

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  {
    ignores: ['**/node_modules/**', '**/dist/**', 'test/test.ts'],
  },
  {
    files: ['**/*.ts'],
    // ignores: ['**/node_modules/**', '**/dist/**','./test/test.ts'],
    languageOptions: {
      parser, // ✅ imported parser object, not a string
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      'prettier/prettier': 'error',
      'no-unused-vars': 'warn',
      'no-console': 'off',
    },
  },
];
