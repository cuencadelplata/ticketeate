import { prisma } from '@repo/db';

export class WalletService {
  static async getWalletStatus(userId: string): Promise<{ wallet_linked: boolean; wallet_provider: string | null }> {
    const user = await prisma.usuario.findUnique({ where: { id_usuario: userId } });
    return {
      wallet_linked: user?.wallet_linked ?? false,
      wallet_provider: user?.wallet_provider ?? null,
    };
  }

  static async linkWallet(userId: string, provider: string = 'mercado_pago'): Promise<{ wallet_linked: boolean; wallet_provider: string | null }> {
    const user = await prisma.usuario.upsert({
      where: { id_usuario: userId },
      update: { wallet_linked: true, wallet_provider: provider || 'mercado_pago' },
      create: {
        id_usuario: userId,
        nombre: 'Usuario',
        apellido: 'Clerk',
        email: `${userId}@clerk.user`,
        wallet_linked: true,
        wallet_provider: provider || 'mercado_pago',
      },
    });
    return { wallet_linked: user.wallet_linked, wallet_provider: user.wallet_provider };
  }

  static async unlinkWallet(userId: string): Promise<{ wallet_linked: boolean; wallet_provider: string | null }> {
    const user = await prisma.usuario.update({
      where: { id_usuario: userId },
      data: { wallet_linked: false, wallet_provider: null },
    });
    return { wallet_linked: user.wallet_linked, wallet_provider: user.wallet_provider };
  }
}


