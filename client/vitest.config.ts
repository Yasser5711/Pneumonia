// import '@testing-library/jest-dom'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, mergeConfig } from 'vitest/config'
import baseConfig from '../vitest.config'
export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      coverage: {
        reporter: ['text', 'html'],
        exclude: [
          'dist/',
          'eslint.config.js',
          'vite.config.ts',
          '**/index.ts',
          'vitest/',
          'tests/',
        ],
        reportsDirectory: './coverage',
        reportOnFailure: true,
        enabled: true,
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
  })
)
