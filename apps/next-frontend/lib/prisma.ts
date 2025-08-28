import pkg from '@prisma/client';
const { PrismaClient } = pkg as any;

const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Asegurar que prisma esté conectado
if (typeof window === 'undefined') {
  prisma.$connect().catch((e: unknown) => {
    console.error('Failed to connect to database:', e);
  });
}
