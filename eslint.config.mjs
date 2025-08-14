// ESLint flat config for Astro + React + TypeScript
// Ref: ESLint v9 flat config, @typescript-eslint, eslint-plugin-astro, react
import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import astro from "eslint-plugin-astro";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default defineConfig([
  // Ignore patterns (flat config uses an ignores-only object)
  {
    ignores: [
      "**/node_modules/**",
      "dist/**",
      "convex/_generated/**",
      "**/*.d.ts",
      "**/*.min.*",
      "**/coverage/**",
      "**/.vercel/**",
      "bun.lockb",
    ],
  },

  // Base JS config
  js.configs.recommended,

  // TypeScript config for .ts/.tsx files
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        project: false,
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      react,
      "react-hooks": reactHooks,
    },
    rules: {
      // TS replaces core checks
      "no-unused-vars": "off",
      "no-undef": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // React (automatic runtime)
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/no-unknown-property": ["error", { ignore: ["class"] }],

      // React hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Allow empty catch blocks (used in middleware)
      "no-empty": ["error", { allowEmptyCatch: true }],
    },
    settings: {
      react: { version: "detect" },
    },
  },

  // Astro files
  ...astro.configs.recommended, // includes parser/processor for .astro
  {
    files: ["**/*.astro"],
    rules: {
      // Let Prettier handle formatting; avoid conflicting stylistic rules
    },
  },

  // General project rules and Prettier interop
  {
    linterOptions: {
      reportUnusedDisableDirectives: "warn",
    },
    rules: {
      // Turn off rules that may conflict with Prettier formatting
      // Using eslint-config-prettier via rule disables (flat config style)
      // (eslint-config-prettier is primarily for eslintrc; in flat config, prefer disabling specific stylistic rules.)
      "arrow-body-style": "off",
      "prefer-arrow-callback": "off",
    },
  },
]);
