import { PrismaClient } from '@prisma/client';

// Export a singleton instance
export const prisma = new PrismaClient();

// Export Prisma types for use in other packages
export type {
  eventos,
  imagenes_evento,
  fechas_evento,
  categorias_entrada,
  reservas,
  usuarios,
  pagos,
  entradas,
  estadisticas,
  colas_evento,
  cola_turnos,
  logs_eventos,
  sesiones,
} from '@prisma/client';

// Enums are no longer exported as we use string literals in the application

// Export the PrismaClient type
export type { PrismaClient } from '@prisma/client';
