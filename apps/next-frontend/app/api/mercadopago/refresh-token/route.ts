import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/db';
import { auth } from '@/lib/auth';

/**
 * Renueva el access token usando el refresh token
 * Implementa el flujo "Refresh Token" según OAuth 2.0 de Mercado Pago
 * @see https://developers.mercadopago.com/es/docs/advanced-payments/oauth/refresh-token
 */
async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
}> {
  const clientId = process.env.MERCADOPAGO_CLIENT_ID;
  const clientSecret = process.env.MERCADOPAGO_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Configuración de Mercado Pago incompleta');
  }

  const tokenResponse = await fetch('https://api.mercadopago.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'ticketeate/1.0',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error('[Refresh Token] Token refresh failed:', {
      status: tokenResponse.status,
      statusText: tokenResponse.statusText,
      body: errorText,
    });
    throw new Error(`Token refresh failed: ${tokenResponse.status} - ${errorText}`);
  }

  const tokenData = await tokenResponse.json();

  if (!tokenData.access_token) {
    throw new Error('Invalid token refresh response from Mercado Pago');
  }

  return {
    access_token: tokenData.access_token,
    expires_in: tokenData.expires_in || 21600, // 6 horas por defecto
  };
}

/**
 * POST /api/mercadopago/refresh-token
 * Renueva el access token del usuario cuando expira
 * Solo accesible para usuarios autenticados
 */
export async function POST(request: NextRequest) {
  try {
    // Validar que el usuario esté autenticado
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = session.user.id;

    // Obtener usuario de la BD
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        mercado_pago_refresh_token: true,
        mercado_pago_token_expires_at: true,
        wallet_linked: true,
      },
    });

    if (!user || !user.wallet_linked || !user.mercado_pago_refresh_token) {
      console.warn('[Refresh Token] User does not have wallet linked:', userId);
      return NextResponse.json({ error: 'Billetera no vinculada' }, { status: 400 });
    }

    // Validar si el token aún es válido (si aún tiene 5 minutos, no renovar)
    const now = new Date();
    const expiresAt = user.mercado_pago_token_expires_at;
    const timeUntilExpiry = expiresAt ? expiresAt.getTime() - now.getTime() : 0;

    if (timeUntilExpiry > 5 * 60 * 1000) {
      // Token aún válido por más de 5 minutos
      return NextResponse.json(
        { message: 'Token still valid', expiresIn: Math.floor(timeUntilExpiry / 1000) },
        { status: 200 },
      );
    }

    // Renovar el token
    try {
      const newTokenData = await refreshAccessToken(user.mercado_pago_refresh_token);
      const newExpiresAt = new Date(Date.now() + newTokenData.expires_in * 1000);

      // Actualizar usuario con nuevo token
      await prisma.user.update({
        where: { id: userId },
        data: {
          mercado_pago_access_token: newTokenData.access_token,
          mercado_pago_token_expires_at: newExpiresAt,
          updatedAt: new Date(),
        },
      });

      console.log('[Refresh Token] Token renewed successfully:', {
        userId,
        expiresIn: newTokenData.expires_in,
      });

      return NextResponse.json(
        {
          message: 'Token renewed successfully',
          expiresIn: newTokenData.expires_in,
          expiresAt: newExpiresAt.toISOString(),
        },
        { status: 200 },
      );
    } catch (refreshError) {
      console.error('[Refresh Token] Failed to refresh token:', refreshError);

      // Si el refresh token también expiró, desvinculamos la billetera
      await prisma.user.update({
        where: { id: userId },
        data: {
          wallet_linked: false,
          mercado_pago_access_token: null,
          mercado_pago_refresh_token: null,
          mercado_pago_token_expires_at: null,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json(
        {
          error: 'Sesión expirada. Por favor, vincula tu billetera nuevamente.',
          code: 'REFRESH_FAILED',
        },
        { status: 401 },
      );
    }
  } catch (error) {
    console.error('[Refresh Token] Unexpected error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
