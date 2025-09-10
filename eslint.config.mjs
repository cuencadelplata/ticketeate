// eslint.config.mjs (ESM)
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  // =======================
  // 0) Ignorados globales
  // =======================
  {
    ignores: [
      // === De tu .eslintignore ===
      '.next/**',
      'dist/**',
      'build/**',
      'node_modules/**',
      'public/build/**',
      '.vscode/**',
      '.DS_Store',

      // === Otros adicionales del repo ===
      '.turbo/**/*',
      '*.config.ts',
      '*.config.js',
      '*.config.mjs',
      'tailwind.config.ts',
      'prisma/**/*',
      '**/*.d.ts',
      'packages/**/*',
      '**/*.min.js',
      '**/*.bundle.js',
      '**/*.chunk.js',
      '**/jest.config.js',
      '**/jest.setup.js',
      '**/coverage/**/*',
      '**/.nyc_output/**/*',
    ],
  },

  // ============================================
  // 1) Frontend (Next.js) - apps/next-frontend
  // ============================================
  {
    files: [
      'apps/next-frontend/**/*.{ts,tsx,js,jsx}', // al correr desde la raíz
      '**/*.{ts,tsx,js,jsx}', // al correr dentro de apps/next-frontend
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        React: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        process: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react,
      'react-hooks': reactHooks,
    },
    rules: {
      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Básicas
      // Desactivar no-undef en TS/TSX: TypeScript ya chequea y permite tipos DOM
      'no-undef': 'off',
      'no-redeclare': 'error',

      // TS
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // ============================================
  // 2) Express backend - apps/express-backend
  // ============================================
  {
    files: ['apps/express-backend/**/*.{ts,js}'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    rules: {
      'no-console': 'warn',
      'no-unused-vars': 'warn',
      'no-undef': 'error',
    },
  },

  // ============================================
  // 3) Hono backend - apps/hono-backend
  // ============================================
  {
    files: ['apps/hono-backend/**/*.{ts,js}'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    rules: {
      'no-console': 'warn',
      'no-unused-vars': 'warn',
      'no-undef': 'error',
    },
  },
];
