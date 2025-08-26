const { nextJsConfig } = require("@repo/eslint-config/next-js");

module.exports = [
  ...nextJsConfig,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@next/next/no-img-element": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react/prop-types": "off",
      "@typescript-eslint/no-require-imports": "off"
    },
    ignores: [
      ".next/**/*",
      "dist/**/*",
      "node_modules/**/*"
    ]
  }
];
