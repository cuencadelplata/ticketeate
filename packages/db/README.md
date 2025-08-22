# @repo/db

Este paquete contiene la configuración de Prisma y el cliente de base de datos para el proyecto.

## Instalación

```bash
pnpm install
```

## Configuración

1. Copia `.env.example` a `.env` y configura tu `DATABASE_URL`
2. Ejecuta `pnpm db:generate` para generar el cliente de Prisma
3. Ejecuta `pnpm db:push` para sincronizar el esquema con la base de datos

## Scripts disponibles

- `pnpm db:generate` - Genera el cliente de Prisma
- `pnpm db:push` - Sincroniza el esquema con la base de datos
- `pnpm db:migrate` - Ejecuta las migraciones
- `pnpm db:studio` - Abre Prisma Studio
- `pnpm db:seed` - Pobla la base de datos con datos de ejemplo

## Uso en otros paquetes

```typescript
import { prisma, User, Post } from '@repo/db';

// Usar el cliente
const users = await prisma.user.findMany();

// Usar los tipos
const newUser: User = {
  id: 'user_id',
  email: 'user@example.com',
  name: 'John Doe',
  createdAt: new Date(),
  updatedAt: new Date(),
};
```
