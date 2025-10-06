import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export type {
  eventos,
  imagenes_evento,
  fechas_evento,
  reservas,
  usuarios,
  pagos,
  entradas,
  estadisticas,
  colas_evento,
  cola_turnos,
  logs_eventos,
  sesiones,
  categoriaevento,
  catevento,
  categorias_entrada,
  categoriaentrada,
  account,
  session,
  user,
  verification,
} from '@prisma/client';

export { EstadoEntrada, EstadoPago, EstadoReserva, EventoEstado, TipoImagen } from '@prisma/client';

export type { PrismaClient } from '@prisma/client';
