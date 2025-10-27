import { describe, it, expect, vi } from 'vitest';

// Mock de Prisma antes de importar
const mockPrisma = {
  user: vi.fn(),
  eventos: vi.fn(),
};

vi.mock('@repo/db', () => ({
  prisma: mockPrisma,
}));

describe('Prisma Config', () => {
  it('should export prisma instance', async () => {
    const prismaModule = await import('../config/prisma');

    expect(prismaModule.prisma).toBe(mockPrisma);
  });

  it('should have prisma instance available', () => {
    expect(mockPrisma).toBeDefined();
    expect(typeof mockPrisma).toBe('object');
  });
});
