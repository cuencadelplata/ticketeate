import { describe, it, expect, vi } from 'vitest';

// Mock prisma
const mockPrisma = {
  user: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
};

vi.mock('@repo/db', () => ({
  prisma: mockPrisma,
}));

describe('Prisma Config', () => {
  it('should export prisma instance', async () => {
    const prismaModule = await import('../config/prisma');

    expect(prismaModule.prisma).toBe(mockPrisma);
  });

  it('should allow prisma operations', async () => {
    const { prisma } = await import('../config/prisma');

    mockPrisma.user.findMany.mockResolvedValue([]);

    const users = await prisma.user.findMany();

    expect(users).toEqual([]);
    expect(mockPrisma.user.findMany).toHaveBeenCalled();
  });
});
