import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/db';

/**
 * Intercambia el authorization code por un access token
 * Implementa el flujo "Authorization Code" según OAuth 2.0 de Mercado Pago
 * @see https://developers.mercadopago.com/es/docs/advanced-payments/oauth/authorization-code
 */
async function exchangeCodeForToken(
  code: string,
  codeVerifier: string,
): Promise<{
  access_token: string;
  refresh_token: string;
  user_id: string;
  expires_in: number;
}> {
  const clientId = process.env.MERCADO_PAGO_CLIENT_ID;
  const clientSecret = process.env.MERCADO_PAGO_CLIENT_SECRET;
  const redirectUri = process.env.MERCADO_PAGO_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
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
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      // PKCE: incluir el code_verifier
      code_verifier: codeVerifier,
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error('[OAuth Callback] Token exchange failed:', {
      status: tokenResponse.status,
      statusText: tokenResponse.statusText,
      body: errorText,
    });
    throw new Error(`Token exchange failed: ${tokenResponse.status} - ${errorText}`);
  }

  const tokenData = await tokenResponse.json();

  // Validar que la respuesta tenga los campos requeridos
  if (!tokenData.access_token || !tokenData.refresh_token || !tokenData.user_id) {
    throw new Error('Invalid token response from Mercado Pago');
  }

  return {
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    user_id: tokenData.user_id,
    expires_in: tokenData.expires_in || 21600, // 6 horas por defecto
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Manejo de errores de OAuth de Mercado Pago
    if (error) {
      console.error('[OAuth Callback] OAuth error from Mercado Pago:', {
        error,
        error_description: errorDescription,
      });

      const errorMap: Record<string, string> = {
        access_denied: 'El usuario canceló la autorización',
        invalid_scope: 'Permisos requeridos inválidos',
        server_error: 'Error en el servidor de Mercado Pago',
        temporarily_unavailable: 'Mercado Pago no disponible temporalmente',
      };

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/configuracion?error=oauth_error&message=${encodeURIComponent(errorMap[error] || 'Error desconocido')}`,
      );
    }

    // Validar parámetros requeridos
    if (!code || !state) {
      console.error('[OAuth Callback] Missing required parameters:', {
        hasCode: !!code,
        hasState: !!state,
      });
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/configuracion?error=missing_params`,
      );
    }

    // Obtener cookies para validar state y code_verifier (PKCE)
    const cookieCodeVerifier = request.cookies.get('oauth_code_verifier')?.value;
    const cookieState = request.cookies.get('oauth_state')?.value;
    const cookieUserId = request.cookies.get('oauth_user_id')?.value;

    // Validar state para protección CSRF
    if (!cookieState || state !== cookieState) {
      console.error('[OAuth Callback] State validation failed:', {
        hasState: !!cookieState,
        stateMatch: state === cookieState,
      });
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/configuracion?error=invalid_state`,
      );
    }

    // Validar que tengamos el code_verifier (PKCE)
    if (!cookieCodeVerifier) {
      console.error('[OAuth Callback] Missing code verifier for PKCE');
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/configuracion?error=invalid_pkce`,
      );
    }

    if (!cookieUserId) {
      console.error('[OAuth Callback] Missing user ID from cookie');
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/configuracion?error=invalid_session`,
      );
    }

    // Intercambiar code por access token
    let tokenData: Awaited<ReturnType<typeof exchangeCodeForToken>>;
    try {
      tokenData = await exchangeCodeForToken(code, cookieCodeVerifier);
      console.log('[OAuth Callback] Token exchange successful:', {
        userId: tokenData.user_id,
        expiresIn: tokenData.expires_in,
      });
    } catch (tokenError) {
      console.error('[OAuth Callback] Token exchange error:', tokenError);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/configuracion?error=token_error`,
      );
    }

    // Calcular fecha de expiración del token
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    // Actualizar usuario en la base de datos
    try {
      await prisma.user.update({
        where: { id: cookieUserId },
        data: {
          wallet_linked: true,
          wallet_provider: 'mercado_pago',
          mercado_pago_user_id: tokenData.user_id,
          mercado_pago_access_token: tokenData.access_token,
          mercado_pago_refresh_token: tokenData.refresh_token,
          mercado_pago_token_expires_at: expiresAt,
          updatedAt: new Date(),
        },
      });

      console.log('[OAuth Callback] User updated successfully:', {
        userId: cookieUserId,
        mercadoPagoUserId: tokenData.user_id,
      });
    } catch (dbError) {
      console.error('[OAuth Callback] Database update error:', dbError);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/configuracion?error=db_error`,
      );
    }

    // Preparar respuesta con redirección exitosa
    const response = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/configuracion?success=wallet_linked`,
    );

    // Limpiar cookies de OAuth
    response.cookies.delete('oauth_code_verifier');
    response.cookies.delete('oauth_state');
    response.cookies.delete('oauth_user_id');

    return response;
  } catch (error) {
    console.error('[OAuth Callback] Unexpected error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/configuracion?error=callback_error`,
    );
  }
}
