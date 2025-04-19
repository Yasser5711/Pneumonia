/** @type {import('stylelint').Config} */
module.exports = {
  customSyntax: 'postcss-scss',
  extends: [
    'stylelint-config-standard',
    'stylelint-config-html', // For <style> blocks in .vue/.html
    'stylelint-config-recommended-vue', // Vue-specific rules
    'stylelint-config-recommended-scss',
    'stylelint-config-tailwindcss',
  ],
  overrides: [
    {
      files: ['**/*.vue'],
      customSyntax: 'postcss-html', // Needed for Vue SFCs
    },
  ],
  rules: {
    'no-empty-source': null, // Avoid annoying empty .vue warnings
    'selector-class-pattern': null, // Tailwind utility classes
    'font-family-no-missing-generic-family-keyword': null, // Tailwind handles fonts
    'no-invalid-double-slash-comments': null,
    'scss/at-rule-no-unknown': null,
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'variants',
          'responsive',
          'screen',
        ],
      },
    ],
  },
  ignoreFiles: ['**/node_modules/**', '**/dist/**', '**/build/**'],
}
