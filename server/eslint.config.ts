import tsPlugin from '@typescript-eslint/eslint-plugin'; // ✅ plugin import
import parser from '@typescript-eslint/parser';

import { FlatCompat } from '@eslint/eslintrc';
import nodePlugin from 'eslint-plugin-n';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import securityPlugin from 'eslint-plugin-security';
const compat = new FlatCompat({ baseDirectory: import.meta.dirname });
/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/types/**',
      '**/migrations/**',
      'test/test.ts',
      'coverage/**',
    ],
  },
  ...compat.extends('plugin:drizzle/recommended'),
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.eslint.json',
      },
    },
    plugins: {
      prettier: eslintPluginPrettier,
      ts: tsPlugin, // ✅ register plugin with a key
      node: nodePlugin,
      security: securityPlugin,
    },
    rules: {
      // ✅ Prettier formatting
      'prettier/prettier': 'error',

      // ✅ General TS hygiene
      'ts/ban-ts-comment': 'error',
      'ts/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      'ts/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // 'ts/explicit-function-return-type': ['warn', { allowExpressions: true }],
      'ts/no-floating-promises': 'error',
      'ts/no-misused-promises': 'error',

      // ✅ Node.js environment rules
      'node/no-unsupported-features/es-syntax': 'off',
      'node/no-missing-import': 'off',

      // ✅ Other good backend defaults
      'no-console': 'error', // could be info-only for logs
      'require-await': 'error',
      'no-duplicate-imports': 'error',
      'no-useless-catch': 'error',
      // ✅ Security rules
      'security/detect-object-injection': 'off', // false positive prone — disable or audit manually
      'security/detect-unsafe-regex': 'warn',
      'security/detect-non-literal-require': 'warn',
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-eval-with-expression': 'error',
      'security/detect-new-buffer': 'error',
    },
  },
];
