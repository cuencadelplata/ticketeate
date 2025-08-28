import { PrismaClient } from '@prisma/client';

// Export a singleton instance
export const prisma = new PrismaClient();
