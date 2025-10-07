import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/db';
import { Buffer } from 'buffer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      console.error('Error de OAuth:', error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/configuracion?error=oauth_error`,
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/configuracion?error=missing_params`,
      );
    }

    // Decodificar state para obtener userId
    let userId: string;
    try {
      const decodedState = JSON.parse(Buffer.from(state, 'base64').toString());
      userId = decodedState.userId;
    } catch {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/configuracion?error=invalid_state`,
      );
    }

    // Intercambiar code por access token
    const tokenResponse = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.MERCADO_PAGO_CLIENT_ID,
        client_secret: process.env.MERCADO_PAGO_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.MERCADO_PAGO_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Error obteniendo token:', await tokenResponse.text());
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/configuracion?error=token_error`,
      );
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, user_id, expires_in } = tokenData;

    // Calcular fecha de expiración
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    // Actualizar usuario en la base de datos
    await prisma.user.update({
      where: { id: userId },
      data: {
        wallet_linked: true,
        wallet_provider: 'mercado_pago',
        mercado_pago_user_id: user_id,
        mercado_pago_access_token: access_token,
        mercado_pago_refresh_token: refresh_token,
        mercado_pago_token_expires_at: expiresAt,
        updatedAt: new Date(),
      },
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/configuracion?success=wallet_linked`,
    );
  } catch (error) {
    console.error('Error en callback de OAuth:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/configuracion?error=callback_error`,
    );
  }
}
