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
      // Use the TypeScript parser so .ts/.tsx files and interfaces/JSX parse correctly
      parser: require("@typescript-eslint/parser"),
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true
        }
        // Note: not providing `project` here to avoid requiring type-aware rules.
      }
      ,
      // Declare common browser/node globals so ESLint doesn't mark them as undefined
      globals: {
        React: "readonly",
        window: "readonly",
        document: "readonly",
        self: "readonly",
        globalThis: "readonly",
        fetch: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        File: "readonly",
        FileList: "readonly",
        FileReader: "readonly",
        Blob: "readonly",
        EventSource: "readonly",
        navigator: "readonly",
        location: "readonly",
        history: "readonly",
        console: "readonly",
        process: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        // DOM typings used in TSX files
        HTMLElement: "readonly",
        HTMLDivElement: "readonly",
        HTMLInputElement: "readonly",
        HTMLButtonElement: "readonly",
        HTMLUListElement: "readonly",
        HTMLLIElement: "readonly",
        HTMLTableElement: "readonly",
        HTMLTableRowElement: "readonly",
        HTMLTableCellElement: "readonly",
        HTMLParagraphElement: "readonly",
        HTMLHeadingElement: "readonly",
        HTMLSpanElement: "readonly",
        HTMLAnchorElement: "readonly",
        HTMLLabelElement: "readonly",
        HTMLTextAreaElement: "readonly",
        HTMLTableSectionElement: "readonly",
        HTMLTableCaptionElement: "readonly"
  ,
  HTMLOListElement: "readonly"
        ,
        KeyboardEvent: "readonly",
        // Browser APIs for WebGL and animation
        ResizeObserver: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        WebGL2RenderingContext: "readonly",
        PointerEvent: "readonly"
      }
    },
    plugins: {
      // map plugin keys to the installed packages
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
      react: require("eslint-plugin-react")
    },
    rules: {
      // Solo reglas muy básicas, el resto lo maneja .eslintrc.json
      "no-undef": "error",
      "no-redeclare": "error",
      // Relax some TS-specific rules at this layer; project-level configs can be stricter
      "@typescript-eslint/no-unused-vars": "warn"
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
