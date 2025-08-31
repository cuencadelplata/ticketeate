<div align="center">
  <a href="https://ticketeate.online">
    <img alt="ticketeate logo" src="apps\next-frontend\public\wordmark-light.png" width="50%" height="50%">
  </a>
</div>

<div align="left">

## Descripción

Ticketeate es un sistema modular para la gestión y venta de entradas a eventos.
Permite la vizualización de eventos, la compra de entradas mediante una cola controlada y la administración completa de los eventos y usuarios mediante API's.

## Proyectos

Este es un monorepo construido con Turborepo que contiene múltiples aplicaciones y paquetes.
Contiene 1 aplicación Next.js (Web con panel administrativo integrado) y 3 aplicaciones backend (Express/Hono)

## Estructura básica

```

├── apps/
│ ├── next-frontend/ # Aplicación Next.js principal con panel administrativo
│ │ ├── /app/page.tsx # Página principal [dominio].com [AWS EC2]
│ │ ├── /app/crear/page.tsx # Formulario creación de evento [dominio].com/crear
│ │ ├── /app/api # API Routes
│ │ └── /deploys # Panel administrativo deploys.[dominio].com [AWS EC2]
│ ├── hono-backend/ # Backend Hono Serverless - [AWS Lambda]
│ ├── express-backend/ # Backend Express
│ └── ws-queue/ # Servicio de cola WebSocket - Redis
├── packages/
│ ├── db/ # Base de datos - Prisma ORM
│ ├── ui/ # Componentes UI compartidos
│ ├── eslint-config/ # Configuración de ESLint
│ └── typescript-config/ # Configuración de TypeScript
└── .github/workflows/ # Workflows de GitHub Actions

```

## ¿Para qué se usa cada cosa?

- Clerk: Autenticación de los usuarios y protección de rutas.
- TanStack Query: Fetch de datos, acciones de servidor, caché, revalidación y persitencia de datos en sesión. (Como reemplazo a useEffect)
- HeroUI: Componentes estilizados
- API Routes (de Nextjs, framework fullstack): Acciones de servidor livianas. Se definen en app/api
- Hono: Framework backend similar a Express para cargas de trabajo recurrentes (Serverless, más rápido y más liviano)
- Prisma ORM: Herramienta para definir esquemas en texto plano e interactuar con la DB de manera directa sin comandos sql. (Sirve para insertar y recuperar información de las tablas).

## ¿Cuál framework usamos?

Usamos Next.js, un framework fullstack basado en React (de pila completa, permite trabajar un frontend y backend en una única aplicación -mediante API Routes-)

## Comandos Disponibles

### Desarrollo

```bash
# Instalar dependencias
pnpm install

# Ejecutar App Nextjs y Backend Hono
pnpm run dev:main

# Ejecutar App Nextjs (desde next-frontend)
npm run dev

# Ejecutar Backend Hono (desde hono-backend)
pnpm run dev

# Construir todos los proyectos
pnpm build
```

### Calidad de Código

```bash
# Ejecutar linting en todos los proyectos
pnpm lint

# Verificar tipos de TypeScript
pnpm check-types

# Formatear código con Prettier
pnpm format

# Verificar formato sin cambiar archivos
pnpm format:check

# Ejecutar tests
pnpm test
```

## Workflows de CI/CD

### 1. **CI Principal** (`.github/workflows/ci.yml`)

Ejecuta en paralelo:

- **Lint & Type Check**: Verifica linting y tipos de TypeScript
- **Test**: Ejecuta todos los tests del proyecto
- **Format Check**: Verifica que el código esté formateado correctamente

### 2. **Pre-commit Checks** (`.github/workflows/pre-commit.yml`)

Se ejecuta en cada commit y PR para:

- Verificar formato del código
- Ejecutar linting rápido
- Verificar tipos de TypeScript
- Comentar en PRs si fallan los checks

### 3. **Lint Individual** (`.github/workflows/lint.yml`)

Workflow dedicado solo para linting y verificación de tipos.

### 4. **Test Individual** (`.github/workflows/test.yml`)

Workflow dedicado solo para ejecución de tests.

### 5. **Format Check Individual** (`.github/workflows/format-check.yml`)

Workflow dedicado solo para verificación de formato.

## Configuración

### Prettier

- Configuración en `.prettierrc`
- Archivos ignorados en `.prettierignore`
- Formato automático con `pnpm format`

### ESLint

- Configuración compartida en `packages/eslint-config`
- Reglas específicas para Next.js y React
- Integración con Prettier

### Turborepo

- Configuración en `turbo.json`
- Caching inteligente para builds y tests
- Dependencias entre proyectos configuradas

## Triggers de Workflows

Los workflows se ejecutan automáticamente en:

- **Push** a `main`, `master`, `develop`
- **Pull Requests** a `main`, `master`, `develop`
- **Pre-commit** en cada commit

</div>
