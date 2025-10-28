const { config } = require("@repo/eslint-config");
const tseslint = require("typescript-eslint");

module.exports = [
  ...config,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts", "dev.ts"],
    ignores: ["**/*.config.js", "**/*.config.ts"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];
