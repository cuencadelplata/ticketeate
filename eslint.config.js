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
      "tailwind.config.ts",
      "prisma/**/*",
      "**/*.d.ts",
      "packages/**/*",
      "**/*.min.js",
      "**/*.bundle.js",
      "**/*.chunk.js"
    ]
  },
  {
    // Configuración específica para next-frontend - solo reglas básicas
    files: ["apps/next-frontend/**/*"],
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
