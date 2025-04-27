import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, mergeConfig } from 'vitest/config'
import baseConfig from '../vitest.config'
export default mergeConfig(
  baseConfig,
  defineConfig({
    plugins: [vue()],
    test: {
      environment: 'happy-dom',
      setupFiles: ['./vitest/setupTest.ts'],
      include: ['src/**/*.{spec,test}.ts'],
      coverage: {
        enabled: true,
        provider: 'istanbul',
        thresholds: {
          branches: 100,
          functions: 20,
          lines: 20,
          statements: 20,
        },
        reporter: ['text', 'json-summary', 'json'],
        reportOnFailure: true,
        reportsDirectory: './coverage',
        exclude: [
          'dist/',
          'eslint.config.js',
          'vite.config.ts',
          '**/index.ts',
          'vitest/',
          'tests/',
          '**/*.d.ts',
        ],
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }),
)
