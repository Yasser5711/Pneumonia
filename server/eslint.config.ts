import tsPlugin from '@typescript-eslint/eslint-plugin'; // ✅ plugin import
import parser from '@typescript-eslint/parser';
import eslintPluginPrettier from 'eslint-plugin-prettier';

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  {
    ignores: ['**/node_modules/**', '**/dist/**', 'test/test.ts', 'coverage/**', 'types/**'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      prettier: eslintPluginPrettier,
      ts: tsPlugin, // ✅ register plugin with a key
    },
    rules: {
      'prettier/prettier': 'error',
      'no-unused-vars': 'warn',
      'no-console': 'error',
      'ts/ban-ts-comment': 'error', // ✅ use alias, not @typescript-eslint
      'ts/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    },
  },
];
