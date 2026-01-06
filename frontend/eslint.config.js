import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-plugin-prettier";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

export default [
  {
    ignores: ["dist", "node_modules", "build"],
  },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "jsx-a11y": jsxA11y,
      import: importPlugin,
      prettier,
    },
    languageOptions: {
      ecmaVersion: "latest",
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        node: {
          extensions: [".js", ".jsx", ".json"],
          paths: ["src"],
        },
      },
    },
    rules: {
      // Prettier integration
      "prettier/prettier": "error",

      // React Hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // React Refresh rules
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],

      // Airbnb JavaScript Style Guide rules
      "no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          ignoreRestSiblings: true,
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
        },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": ["error", "always"],
      "quote-props": ["error", "as-needed"],
      "prefer-template": "error",
      "prefer-arrow-callback": "error",
      "arrow-body-style": ["error", "as-needed"],
      "no-param-reassign": ["error", { props: false }],
      "prefer-destructuring": ["error", { object: true, array: false }],
      eqeqeq: ["error", "always"],
      "no-nested-ternary": "error",
      "no-unneeded-ternary": "error",
      "spaced-comment": ["error", "always"],

      // Import rules (Airbnb style)
      "import/prefer-default-export": "off", // Modern React prefers named exports
      "import/extensions": ["error", "ignorePackages", { js: "never", jsx: "never" }],
      "import/no-unresolved": [
        "error",
        {
          ignore: ["^vite$", "^@vitejs/", "^@eslint/", "^eslint/", "^react-error-boundary$"],
        },
      ],
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",

      // React rules (Airbnb React Style Guide)
      "react/jsx-filename-extension": ["error", { extensions: [".jsx"] }],
      "react/jsx-uses-react": "off", // Not needed in React 17+
      /* Prevent variables used in JSX (like `StrictMode` or component imports)
      from being marked as unused by `no-unused-vars`. */
      "react/jsx-uses-vars": "error",
      "react/react-in-jsx-scope": "off", // Not needed in React 17+
      "react/prop-types": "off",
      "react/require-default-props": "warn",
      "react/default-props-match-prop-types": "error",
      "react/no-unused-prop-types": "error",
      "react/jsx-props-no-spreading": ["warn", { custom: "ignore" }],
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "function-declaration",
          unnamedComponents: "arrow-function",
        },
      ],
      "react/jsx-pascal-case": "error",
      "react/jsx-no-bind": ["error", { allowArrowFunctions: true }],
      "react/self-closing-comp": "error",
      "react/jsx-wrap-multilines": [
        "error",
        {
          declaration: "parens-new-line",
          assignment: "parens-new-line",
          return: "parens-new-line",
          arrow: "parens-new-line",
        },
      ],
      "react/jsx-boolean-value": ["error", "never"],
      "react/no-array-index-key": "warn",
      "react/jsx-key": "error",
      "react/no-danger": "warn",

      // Accessibility rules (jsx-a11y)
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-role": "error",
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/heading-has-content": "error",
      "jsx-a11y/html-has-lang": "error",
      "jsx-a11y/img-redundant-alt": "error",
      "jsx-a11y/no-access-key": "error",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",
    },
  },
  // Disable some rules for Prettier compatibility
  prettierConfig,
];
