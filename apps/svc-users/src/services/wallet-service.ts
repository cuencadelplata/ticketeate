import { prisma } from '@repo/db';

export class WalletService {
  static async getWalletStatus(
    userId: string,
  ): Promise<{ wallet_linked: boolean; wallet_provider: string | null }> {
    const user = await prisma.usuario.findUnique({ where: { usuarioid: userId } });
    return {
      wallet_linked: user?.wallet_linked ?? false,
      wallet_provider: user?.wallet_provider ?? null,
    };
  }

  static async linkWallet(
    userId: string,
    provider: string = 'mercado_pago',
  ): Promise<{ wallet_linked: boolean; wallet_provider: string | null }> {
    const user = await prisma.usuario.upsert({
      where: { usuarioid: userId },
      update: { wallet_linked: true, wallet_provider: provider || 'mercado_pago' },
      create: {
        usuarioid: userId,
        nombre: 'Usuario',
        apellido: 'Clerk',
        email: `${userId}@clerk.user`,
        wallet_linked: true,
        wallet_provider: provider || 'mercado_pago',
      },
    });
    return { wallet_linked: user.wallet_linked, wallet_provider: user.wallet_provider };
  }

  static async unlinkWallet(
    userId: string,
  ): Promise<{ wallet_linked: boolean; wallet_provider: string | null }> {
    const user = await prisma.usuario.update({
      where: { usuarioid: userId },
      data: { wallet_linked: false, wallet_provider: null },
    });
    return { wallet_linked: user.wallet_linked, wallet_provider: user.wallet_provider };
  }
}
