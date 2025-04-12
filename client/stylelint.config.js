// stylelint.config.js
/** @type {import('stylelint').Config} */
export default {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-tailwindcss',
    'stylelint-config-prettier'
  ],
  rules: {
    // Disable BEM/kebab-case strict naming
    'selector-class-pattern': null,
    'keyframes-name-pattern': null,
  },
  ignoreFiles: [
    '**/node_modules/**',
    '**/dist/**'
  ]
}
