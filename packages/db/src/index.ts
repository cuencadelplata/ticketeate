import { PrismaClient } from '@prisma/client';

// Ensure a single PrismaClient instance across hot-reloads in dev
declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var __categoria_mw__: boolean | undefined;
}

function createPrismaClient(): PrismaClient {
  const datasourceUrl = process.env.DATABASE_URL;
  if (!datasourceUrl) {
    console.warn(
      '[db] DATABASE_URL no está definida. Configura .env.local en apps/next-frontend o variables de entorno del proceso.',
    );
  }

  // Log mínimo para facilitar debugging de conexión
  const enableQueryLogs = process.env.PRISMA_LOG_QUERIES === 'true';
  const logLevels = (enableQueryLogs ? ['query', 'warn', 'error'] : ['warn', 'error']) as any;

  const client = new PrismaClient({
    log: logLevels,
    datasources: datasourceUrl ? { db: { url: datasourceUrl } } : undefined,
  });

  // Middleware de protección: NO permitir crear/upsert en CategoriaEntrada
  if (!globalThis.__categoria_mw__) {
    client.$use(async (params, next) => {
      if (
        params.model === 'CategoriaEntrada' &&
        (params.action === 'create' || params.action === 'createMany' || params.action === 'upsert')
      ) {
        throw new Error(
          '[DB policy] Operación bloqueada: no se permite crear/upsert en categorias_entrada desde la aplicación.',
        );
      }
      return next(params);
    });
    globalThis.__categoria_mw__ = true;
  }

  return client;
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
