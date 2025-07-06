import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import VueRouter from 'unplugin-vue-router/vite'
import Layouts from 'vite-plugin-vue-layouts'
import vuetify from 'vite-plugin-vuetify'
import { defineConfig, mergeConfig, type ViteUserConfig } from 'vitest/config'

import baseConfig from '../vitest.config'

export default defineConfig(
  mergeConfig(baseConfig as ViteUserConfig, {
    plugins: [
      VueRouter({
        dts: 'src/typed-router.d.ts',
      }),
      AutoImport({
        // Match the configuration from your vite.config.ts
        imports: [
          'vue',
          {
            'vue-router/auto': ['useRoute', 'useRouter'],
          },
        ],
        // Point to the directories where your composables and stores are
        dirs: ['src/composables', 'src/stores'],
        dts: 'src/auto-imports.d.ts', // Optional for tests, but good practice
      }),
      vue(),
      Layouts(),
      vuetify({ autoImport: true }),
    ],
    test: {
      environment: 'happy-dom',
      setupFiles: ['./vitest/setupTest.ts'],
      include: ['src/**/*.{spec,test}.ts'],
      coverage: {
        enabled: true,
        provider: 'istanbul',

        thresholds: {
          branches: 10,
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
          'vitest/',
          'tests/',
          '**/*.d.ts',
        ],
      },
      server: {
        deps: {
          inline: [/vuetify/],
        },
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }),
)
