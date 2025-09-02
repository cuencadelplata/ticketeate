import { PrismaClient } from '@prisma/client';

// Export a singleton instance
export const prisma = new PrismaClient();

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

// Enums are no longer exported as we use string literals in the application

// Export the PrismaClient type
export type { PrismaClient } from '@prisma/client';
