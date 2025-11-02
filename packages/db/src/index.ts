import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export type {
  eventos,
  imagenes_evento,
  fechas_evento,
  reservas,
  pagos,
  entradas,
  estadisticas,
  colas_evento,
  cola_turnos,
  logs_eventos,
  sesiones,
  categoriaevento,
  account,
  session,
  user,
  cupones_evento,
  cupones_evento_history,
  cupones_redimidos,
} from '@prisma/client';

// Los tipos de cupones están disponibles en runtime via prisma.cupones_evento
// TypeScript los reconocerá después de regenerar el cliente
// export type { cupones_evento, cupones_evento_history, cupones_redimidos } from '@prisma/client';

export { EstadoEntrada, EstadoPago, EstadoReserva, EventoEstado, TipoImagen } from '@prisma/client';

export type { PrismaClient } from '@prisma/client';

// Better Auth configuration is handled in the frontend app
// export { auth } from './auth';
