import js from "@eslint/js";
import pluginNext from "@next/eslint-plugin-next";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginJsxA11y from "eslint-plugin-jsx-a11y";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

import { config as baseConfig } from "./base.js";

/**
 * A custom ESLint configuration for Next.js projects.
 *
 * @type {import("eslint").ESLint.ConfigData[]}
 */
export const nextJsConfig = [
  ...baseConfig,
  js.configs.recommended, // ESLint's recommended rules
  ...tseslint.configs.recommended, // TypeScript ESLint recommended rules

  // React specific configurations
  {
    ...pluginReact.configs.flat.recommended, // React recommended rules
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.browser, // Add browser globals for React/Next.js client-side code
        ...globals.serviceworker,
      },
    },
    settings: { react: { version: "detect" } }, // Automatically detect React version
    rules: {
      "react/react-in-jsx-scope": "off", // Not needed with new JSX transform
      "react/prop-types": "off", // Often handled by TypeScript
    },
  },

  // React Hooks configurations
  {
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules, // React Hooks recommended rules
    },
  },

  // Next.js specific configurations
  {
    plugins: {
      "@next/next": pluginNext,
    },
    rules: {
      ...pluginNext.configs.recommended.rules, // Next.js recommended rules
      ...pluginNext.configs["core-web-vitals"].rules, // Next.js Core Web Vitals rules
    },
  },

  // JSX A11y configurations
  {
    files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"], // Apply only to relevant files
    plugins: {
      "jsx-a11y": eslintPluginJsxA11y,
    },
    // Spread the recommended configuration for jsx-a11y
    // This includes both rules and languageOptions if provided by the plugin
    ...eslintPluginJsxA11y.flatConfigs.recommended,
    // Optionally, ensure specific globals if not covered by flatConfigs.recommended
    languageOptions: {
      ...(eslintPluginJsxA11y.flatConfigs.recommended.languageOptions || {}),
      globals: {
        ...globals.browser,
        ...globals.serviceworker,
      },
    },
  },

  // Prettier configuration (should be last to override other formatting rules)
  eslintConfigPrettier,
];
