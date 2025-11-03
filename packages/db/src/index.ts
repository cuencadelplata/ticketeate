import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export * from '@prisma/client';

export type { PrismaClient } from '@prisma/client';

// Better Auth configuration is handled in the frontend app
// export { auth } from './auth';
// Prisma types are re-exported above with `export * from '@prisma/client';`
