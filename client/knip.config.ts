import type { KnipConfig } from 'knip'
const config: KnipConfig = {
  project: ['./tsconfig.app.json', './tsconfig.node.json'],
  entry: ['src/main.ts', 'knip-hints.ts'],

  ignoreDependencies: ['@trpc/server'],
  ignoreBinaries: [
    'vite',
    'vue-tsc',
    'eslint',
    'prettier',
    'stylelint',
    'vitest',
    'knip',
    'depcheck',
    'ts-prune',
    'vue-i18n-extract',
  ],
}

export default config
