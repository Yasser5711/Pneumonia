/**
 * .eslint.js
 *
 * ESLint configuration file.
 */

import vueTsEslintConfig from "@vue/eslint-config-typescript";
import pluginVue from "eslint-plugin-vue";

export default [
  {
    name: "app/files-to-lint",
    files: ["**/*.{ts,mts,tsx,vue}"],
  },

  {
    name: "app/files-to-ignore",
    ignores: ["**/dist/**", "**/dist-ssr/**", "**/coverage/**"],
  },

  ...pluginVue.configs["flat/recommended"],
  ...vueTsEslintConfig(),

  {
    rules: {
      "no-constructor-return": "error",
      "no-duplicate-imports": "error",
      "no-new-native-nonconstructor": "error",
      "no-unused-private-class-members": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
        },
      ],
      "block-scoped-var": "error",
      curly: ["error", "multi-line"],
      "default-case": "error",
      "default-case-last": "error",
      eqeqeq: "error",
      "new-cap": ["error", { capIsNewExceptions: ["STRING"] }],
      "no-alert": "error",
      "no-caller": "error",
      "no-console": ["error", { allow: ["warn", "error", "log", "info"] }],
      "no-empty-static-block": "error",
      "no-eq-null": "error",
      "no-eval": "error",
      "no-extend-native": "error",
      "no-extra-bind": "error",
      "no-floating-decimal": "error",
      "no-implicit-globals": "error",
      "no-lonely-if": "error",
      "no-multi-assign": "error",
      "no-new": "error",
      "no-new-func": "error",
      "no-new-object": "error",
      "no-new-wrappers": "error",
      "no-param-reassign": "error",
      "no-return-assign": "error",
      "no-sequences": "error",
      "no-unneeded-ternary": "error",
      "no-useless-call": "error",
      "no-useless-computed-key": "error",
      "no-useless-concat": "error",
      "no-useless-constructor": "error",
      "no-useless-return": "error",
      "no-var": "error",
      "object-shorthand": "error",
      "one-var-declaration-per-line": "error",
      "prefer-const": "error",
      "prefer-rest-params": "error",
      "prefer-spread": "error",
      "prefer-template": "error",
      "require-await": "error",
      "require-unicode-regexp": "error",
      "no-multiple-empty-lines": "error",
    },
  },
];
