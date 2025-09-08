import { PrismaClient } from '@prisma/client';

// Ensure a single PrismaClient instance across hot-reloads in dev
declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const datasourceUrl = process.env.DATABASE_URL;
  if (!datasourceUrl) {
    console.warn(
      '[db] DATABASE_URL no está definida. Configura .env.local en apps/next-frontend o variables de entorno del proceso.',
    );
  }

  // Log mínimo para facilitar debugging de conexión
  return new PrismaClient({
    log: ['warn', 'error'],
    datasources: datasourceUrl ? { db: { url: datasourceUrl } } : undefined,
  });
}

export const prisma: PrismaClient = globalThis.__prisma__ ?? createPrismaClient();
if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma__ = prisma;
}

// Export Prisma types for use in other packages
export type {
  Evento,
  ImagenEvento,
  FechaEvento,
  CategoriaEntrada,
  Reserva,
  Usuario,
  Pago,
  Entrada,
  Estadistica,
  ColaEvento,
  ColaTurno,
  LogEvento,
  Sesion,
} from '@prisma/client';

// Export the PrismaClient type
export type { PrismaClient } from '@prisma/client';
