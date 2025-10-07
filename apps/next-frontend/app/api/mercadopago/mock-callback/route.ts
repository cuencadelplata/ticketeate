import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/configuracion?error=missing_user`,
      );
    }

    // Simular datos de Mercado Pago para desarrollo
    const mockTokenData = {
      access_token: `mock_access_token_${Date.now()}`,
      refresh_token: `mock_refresh_token_${Date.now()}`,
      user_id: `mock_user_${Date.now()}`,
      expires_in: 3600, // 1 hora
    };

    const expiresAt = new Date(Date.now() + mockTokenData.expires_in * 1000);

    // Actualizar usuario en la base de datos
    await prisma.user.update({
      where: { id: userId },
      data: {
        wallet_linked: true,
        wallet_provider: 'mercado_pago',
        mercado_pago_user_id: mockTokenData.user_id,
        mercado_pago_access_token: mockTokenData.access_token,
        mercado_pago_refresh_token: mockTokenData.refresh_token,
        mercado_pago_token_expires_at: expiresAt,
        updatedAt: new Date(),
      },
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/configuracion?success=wallet_linked&mock=true`,
    );
  } catch (error) {
    console.error('Error en mock callback:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/configuracion?error=mock_callback_error`,
    );
  }
}
