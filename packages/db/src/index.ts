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
} from '@prisma/client';

export { EstadoEntrada, EstadoPago, EstadoReserva, EventoEstado, TipoImagen } from '@prisma/client';

export type { PrismaClient } from '@prisma/client';

// Better Auth configuration is handled in the frontend app
// export { auth } from './auth';
