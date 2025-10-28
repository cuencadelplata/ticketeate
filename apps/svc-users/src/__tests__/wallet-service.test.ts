import { describe, it, expect, vi } from 'vitest';

// Mock prisma
const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

vi.mock('@repo/db', () => ({
  prisma: mockPrisma,
}));

describe('WalletService', () => {
  it('should be importable', async () => {
    const { WalletService } = await import('../services/wallet-service.js');
    expect(WalletService).toBeDefined();
    expect(typeof WalletService.getWalletStatus).toBe('function');
    expect(typeof WalletService.linkWallet).toBe('function');
    expect(typeof WalletService.unlinkWallet).toBe('function');
    expect(typeof WalletService.refreshToken).toBe('function');
  });

  it('should have correct interface', async () => {
    const { WalletService } = await import('../services/wallet-service.js');

    // Test that the service has the expected methods
    expect(WalletService.getWalletStatus).toBeInstanceOf(Function);
    expect(WalletService.linkWallet).toBeInstanceOf(Function);
    expect(WalletService.unlinkWallet).toBeInstanceOf(Function);
    expect(WalletService.refreshToken).toBeInstanceOf(Function);
  });
});
