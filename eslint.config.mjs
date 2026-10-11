import tsParser from "@typescript-eslint/parser";

export default [
  {
    ignores: [".next/*", "node_modules/*", "data/*", "public/*", "tests/fixtures/*"],
  },
  {
    files: ["src/**/*.{ts,tsx}", "tests/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      "no-console": "off",
    },
  },
];
