const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat();

module.exports = [
  {
    ignores: [
      '.next/**/*',
      'dist/**/*', 
      'build/**/*',
      'node_modules/**/*',
      'out/**/*',
      '.vercel/**/*',
      'coverage/**/*',
      '*.config.js',
      '*.config.mjs',
      '*.config.ts',
      '*.config.tsx'
    ],
  },
  ...compat.extends('next/core-web-vitals'),
  {
    rules: {
      'no-undef': 'off',
      'no-console': 'off',
      'no-unused-vars': 'warn',
    },
    languageOptions: {
      globals: {
        URL: 'readonly',
        URLSearchParams: 'readonly',
        fetch: 'readonly',
        EventSource: 'readonly',
        Blob: 'readonly',
        document: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        TextEncoder: 'readonly',
        ReadableStream: 'readonly',
      },
    },
  },
];
