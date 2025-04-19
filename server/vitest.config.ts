import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../vitest.config';
export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'node',
      setupFiles: ['./test/setup.ts'],
      coverage: {
        thresholds: {
          global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
          },
        },
        exclude: [
          'types/',
          'dist/',
          'eslint.config.js',
          'vite.config.ts',
          'src/env.ts',
          '**/index.ts',
          'test/test.ts',
        ],
      },
    },
  }),
);
