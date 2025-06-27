import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig, mergeConfig } from 'vitest/config';

import baseConfig from '../vitest.config';

const merged = mergeConfig(baseConfig, {
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    silent: Boolean(process.env.CI),
    coverage: {
      enabled: true,
      provider: 'istanbul',
      reporter: ['text', 'text-summary', 'lcov', 'json', 'json-summary'],
      reportsDirectory: './coverage',
      reportOnFailure: true,
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
      exclude: [
        'types/',
        'dist/',
        'eslint.config.js',
        'drizzle.config.ts',
        'vite.config.ts',
        'src/env.ts',
        'src/errors/**',
        '**/index.ts',
        'test/test.ts',
        'src/db/migrations/**',
        'src/db/schema/**',
        'scripts/**',
      ],
    },
  },
});

export default defineConfig(merged);
