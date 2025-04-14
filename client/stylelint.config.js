// stylelint.config.js
/** @type {import('stylelint').Config} */
export default {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-html', // 👈 support for <style> in .vue/.html
    'stylelint-config-recommended-vue' // 👈 specific Vue rules
  ],
  overrides: [
    {
      files: ['**/*.vue'],
      customSyntax: 'postcss-html', // needed for Vue SFCs
    },
  ],
  ignoreFiles: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
  ],
}
