import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

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

export type { PrismaClient } from '@prisma/client';
