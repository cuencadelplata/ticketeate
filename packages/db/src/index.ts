import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export { prisma }; // <-- Agrega esta línea

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