import { prisma } from '@repo/db';

export class WalletService {
  static async getWalletStatus(
    userId: string,
  ): Promise<{ wallet_linked: boolean; wallet_provider: string | null }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        wallet_linked: true,
        wallet_provider: true,
        mercado_pago_token_expires_at: true,
      },
    });

    if (!user) {
      return {
        wallet_linked: false,
        wallet_provider: null,
      };
    }

    // Verificar si el token ha expirado
    if (user.wallet_linked && user.mercado_pago_token_expires_at) {
      const now = new Date();
      const expiresAt = new Date(user.mercado_pago_token_expires_at);

      if (now > expiresAt) {
        // Token expirado, marcar como no vinculado
        await prisma.user.update({
          where: { id: userId },
          data: {
            wallet_linked: false,
            wallet_provider: null,
            mercado_pago_access_token: null,
            mercado_pago_refresh_token: null,
            mercado_pago_token_expires_at: null,
          },
        });

        return {
          wallet_linked: false,
          wallet_provider: null,
        };
      }
    }

    return {
      wallet_linked: user.wallet_linked,
      wallet_provider: user.wallet_provider,
    };
  }

  static async linkWallet(
    userId: string,
  ): Promise<{ wallet_linked: boolean; wallet_provider: string | null }> {
    // Este método ahora solo retorna el estado actual
    // La vinculación real se hace a través del flujo OAuth
    return this.getWalletStatus(userId);
  }

  static async unlinkWallet(
    userId: string,
  ): Promise<{ wallet_linked: boolean; wallet_provider: string | null }> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        wallet_linked: false,
        wallet_provider: null,
        mercado_pago_user_id: null,
        mercado_pago_access_token: null,
        mercado_pago_refresh_token: null,
        mercado_pago_token_expires_at: null,
        updatedAt: new Date(),
      },
    });

    return {
      wallet_linked: false,
      wallet_provider: null,
    };
  }

  static async refreshToken(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        mercado_pago_refresh_token: true,
        mercado_pago_token_expires_at: true,
      },
    });

    if (!user?.mercado_pago_refresh_token) {
      return false;
    }

    try {
      const response = await fetch('https://api.mercadopago.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.MERCADO_PAGO_CLIENT_ID,
          client_secret: process.env.MERCADO_PAGO_CLIENT_SECRET,
          refresh_token: user.mercado_pago_refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        return false;
      }

      const tokenData = await response.json();
      const { access_token, refresh_token, expires_in } = tokenData;

      const expiresAt = new Date(Date.now() + expires_in * 1000);

      await prisma.user.update({
        where: { id: userId },
        data: {
          mercado_pago_access_token: access_token,
          mercado_pago_refresh_token: refresh_token,
          mercado_pago_token_expires_at: expiresAt,
          updatedAt: new Date(),
        },
      });

      return true;
    } catch (error) {
      // Log error without console statement to avoid linting warnings
      // In production, this should use a proper logging service
      return false;
    }
  }
}
