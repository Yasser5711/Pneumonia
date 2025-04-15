// import '@testing-library/jest-dom'
import { defineConfig, mergeConfig } from 'vitest/config'
import baseConfig from '../vitest.config'
export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      environment: 'happy-dom',
      setupFiles: ['./vitest/setupTest.ts'],
      include: ['src/**/*.{spec,test}.ts'],
    },
  })
)
