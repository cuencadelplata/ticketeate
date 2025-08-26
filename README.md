<div align="center">
<picture>
  <img alt="ticketeate logo" src="apps\next-frontend\public\wordmark-ticketeate.png" width="50%" height="50%">
  
</picture>
Accede a tus eventos favoritos de manera fácil y segura.
</div>

<div align="lef

## Descripción

Ticketeate es un sistema modular para la gestión y venta de entradas a eventos.
Permite la vizualización de eventos, la compra de entradas mediante una cola controlada y la administración completa de los eventos y usuarios mediante API's.

## Características

- Búsqueda de eventos por categoría y ubicación
- Compra segura de entradas
- Gestión de usuarios y eventos
- Panel de administración para organizadores
- Soporte para múltiples métodos de pago

Este es un monorepo construido con Turborepo que contiene múltiples aplicaciones y paquetes.
Contiene 1 aplicación Next.js (Web con panel administrativo integrado) y 3 aplicaciones backend (Express/Hono)

## Estructura básica

```
├── apps/
│   ├── web/                 # Aplicación Next.js principal con panel administrativo
│   │   ├── /                # Página principal [dominio].com [AWS EC2]
│   │   └── /deploys         # Panel administrativo deploys.[dominio].com [AWS EC2]
│   ├── hono-backend/        # Backend Hono Serverless - [AWS Lambda]
│   ├── express-backend/     # Backend Express
│   └── ws-queue/            # Servicio de cola WebSocket - Redis
├── packages/
│   ├── db/                  # Base de datos - Prisma ORM
│   ├── ui/                  # Componentes UI compartidos
│   ├── eslint-config/       # Configuración de ESLint
│   └── typescript-config/   # Configuración de TypeScript
└── .github/workflows/       # Workflows de GitHub Actions
```

## Comandos Disponibles

### Desarrollo

```bash
# Instalar dependencias
pnpm install

# Ejecutar en modo desarrollo
pnpm dev

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
