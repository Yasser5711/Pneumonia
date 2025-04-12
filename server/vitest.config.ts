import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      enabled: true,
      provider: 'istanbul',
      reporter: ['text', 'text-summary', 'lcov', 'json', 'json-summary'],
      reportsDirectory: './coverage',
      reportOnFailure: true,
      exclude: [
        'dist/',
        'eslint.config.js',
        'vite.config.ts',
        'src/env.ts',
        '**/index.ts',
        'test/test.ts',
      ],
    },
  },
});
