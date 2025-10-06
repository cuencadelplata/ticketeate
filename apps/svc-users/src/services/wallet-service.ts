import { prisma } from '@repo/db';

export class WalletService {
  static async getWalletStatus(
    userId: string,
  ): Promise<{ wallet_linked: boolean; wallet_provider: string | null }> {
    // Por ahora retornamos valores por defecto ya que la tabla user no tiene campos de wallet
    // TODO: Agregar campos wallet_linked y wallet_provider a la tabla user si es necesario
    return {
      wallet_linked: false,
      wallet_provider: null,
    };
  }

  static async linkWallet(
    userId: string,
    provider: string = 'mercado_pago',
  ): Promise<{ wallet_linked: boolean; wallet_provider: string | null }> {
    // Por ahora retornamos valores por defecto ya que la tabla user no tiene campos de wallet
    // TODO: Agregar campos wallet_linked y wallet_provider a la tabla user si es necesario
    return { wallet_linked: false, wallet_provider: null };
  }

  static async unlinkWallet(
    userId: string,
  ): Promise<{ wallet_linked: boolean; wallet_provider: string | null }> {
    // Por ahora retornamos valores por defecto ya que la tabla user no tiene campos de wallet
    // TODO: Agregar campos wallet_linked y wallet_provider a la tabla user si es necesario
    return { wallet_linked: false, wallet_provider: null };
  }
}
