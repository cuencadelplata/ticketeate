import { PrismaClient } from '@prisma/client';

// Export a singleton instance
export const prisma = new PrismaClient();

// Export types
export type { User, Post } from '@prisma/client';
