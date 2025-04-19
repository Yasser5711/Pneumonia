import type { KnipConfig } from 'knip'
const config: KnipConfig = {
  project: ['./tsconfig.json', './tsconfig.app.json', './tsconfig.node.json'],
  entry: ['src/main.ts'],

  ignoreDependencies: [
    '@tanstack/vue-query',
    '@vueuse/motion',
    'core-js',
    'vue-final-modal',
    'vue-router',
    'depcheck',
    'prettier',
    'eslint',
    'sass',
    'sass-embedded',
    'ts-prune',
    'vite-plugin-pwa',
    '@vitest/coverage-istanbul',
    'lucide-vue-next',
    'vue-eslint-parser',
    'vue-tsc',
    '@vitest/coverage-v8',
  ],
  ignoreBinaries: [
    'vite',
    'run-p',
    'vue-tsc',
    'eslint',
    'prettier',
    'stylelint',
    'vitest',
    'knip',
    'depcheck',
    'ts-prune',
  ],
}

export default config
