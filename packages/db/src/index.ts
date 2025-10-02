import { PrismaClient } from '@prisma/client';

// Export a singleton instance
export const prisma = new PrismaClient();

// Export Prisma types for use in other packages
export type {
  eventos,
  imagenes_evento,
  fechas_evento,
  stock_entrada,
  reservas,
  usuarios,
  pagos,
  entradas,
  estadisticas,
  colas_evento,
  cola_turnos,
  logs_eventos,
  sesiones,
  evento_estado,
  categoriaevento,
  catevento,
  movimientos_entradas,
} from '@prisma/client';

// Export the PrismaClient type
export type { PrismaClient } from '@prisma/client';
