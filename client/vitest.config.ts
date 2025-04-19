import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, mergeConfig } from 'vitest/config'
import baseConfig from '../vitest.config'
export default mergeConfig(
  baseConfig,
  defineConfig({
    plugins: [vue()],
    test: {
      coverage: {
        thresholds: {
          global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
          },
        },
        reporter: ['text', 'lcov', 'json-summary', 'json'],
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
      environment: 'happy-dom',
      setupFiles: ['./vitest/setupTest.ts'],
      include: ['src/**/*.{spec,test}.ts'],
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }),
)
