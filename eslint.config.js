module.exports = [
  {
    // Configuración global que ignora archivos innecesarios
    ignores: [
      "node_modules/**/*",
      "dist/**/*",
      "build/**/*",
      ".next/**/*",
      ".turbo/**/*",
      "*.config.ts",
      "*.config.js",
      "*.config.mjs",
      "tailwind.config.ts",
      "prisma/**/*",
      "**/*.d.ts",
      "packages/**/*",
      "**/*.min.js",
      "**/*.bundle.js",
      "**/*.chunk.js",
      "**/jest.config.js",
      "**/jest.setup.js",
      "**/coverage/**/*",
      "**/.nyc_output/**/*"
    ]
  },
  {
    // Configuración específica para next-frontend - solo reglas básicas
    files: ["apps/next-frontend/**/*"],
    ignores: [
      "apps/next-frontend/.next/**/*",
      "apps/next-frontend/dist/**/*",
      "apps/next-frontend/build/**/*",
      "apps/next-frontend/node_modules/**/*",
      "apps/next-frontend/jest.config.js",
      "apps/next-frontend/jest.setup.js"
    ],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module"
      }
    },
    rules: {
      // Solo reglas muy básicas, el resto lo maneja .eslintrc.json
      "no-undef": "error",
      "no-redeclare": "error"
    }
  },
  {
    // Configuración específica para express-backend
    files: ["apps/express-backend/**/*"],
    ignores: [
      "apps/express-backend/dist/**/*",
      "apps/express-backend/build/**/*",
      "apps/express-backend/node_modules/**/*"
    ],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module"
      }
    },
    rules: {
      "no-console": "warn",
      "no-unused-vars": "warn",
      "no-undef": "error"
    }
  },
  {
    // Configuración específica para hono-backend
    files: ["apps/hono-backend/**/*"],
    ignores: [
      "apps/hono-backend/dist/**/*",
      "apps/hono-backend/build/**/*",
      "apps/hono-backend/node_modules/**/*"
    ],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module"
      }
    },
    rules: {
      "no-console": "warn",
      "no-unused-vars": "warn",
      "no-undef": "error"
    }
  }
];
