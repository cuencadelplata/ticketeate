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
  const clientId = process.env.MERCADOPAGO_CLIENT_ID;
  const clientSecret = process.env.MERCADOPAGO_CLIENT_SECRET;
  const redirectUri = process.env.MERCADOPAGO_REDIRECT_URI;

  console.log('[OAuth Token Exchange] Configuration check:', {
    hasClientId: !!clientId,
    hasClientSecret: !!clientSecret,
    hasRedirectUri: !!redirectUri,
    clientId: clientId, // Mostrar completo para debug
    clientSecretLength: clientSecret?.length,
    redirectUri,
  });

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Configuración de Mercado Pago incompleta');
  }

  const payload = {
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    ...(codeVerifier && { code_verifier: codeVerifier }), // Solo incluir si existe
  };

  console.log('[OAuth Token Exchange] Request payload:', {
    client_id: clientId,
    client_secret: '***',
    grant_type: payload.grant_type,
    code: code.substring(0, 20) + '...',
    redirect_uri: redirectUri,
    has_code_verifier: !!codeVerifier,
  });

  const tokenResponse = await fetch('https://api.mercadopago.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'ticketeate/1.0',
    },
    body: JSON.stringify(payload),
  });

  console.log('[OAuth Token Exchange] Response status:', {
    status: tokenResponse.status,
    statusText: tokenResponse.statusText,
    contentType: tokenResponse.headers.get('content-type'),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error('[OAuth Callback] Token exchange failed:', {
      status: tokenResponse.status,
      statusText: tokenResponse.statusText,
      responseBody: errorText,
      requestPayload: {
        client_id: clientId,
        grant_type: 'authorization_code',
        code: code.substring(0, 20) + '...',
      },
    });
    throw new Error(`Token exchange failed: ${tokenResponse.status} - ${errorText}`);
  }

  const tokenData = await tokenResponse.json();

  console.log('[OAuth Token Exchange] Token response received:', {
    hasAccessToken: !!tokenData.access_token,
    hasRefreshToken: !!tokenData.refresh_token,
    hasUserId: !!tokenData.user_id,
    expiresIn: tokenData.expires_in,
    tokenType: tokenData.token_type,
  });

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

    console.log('[OAuth Callback] ===== CALLBACK INITIATED =====');
    console.log('[OAuth Callback] Request URL:', request.url);
    console.log('[OAuth Callback] Callback parameters:', {
      url: request.url,
      hasCode: !!code,
      codeLength: code?.length,
      hasState: !!state,
      stateLength: state?.length,
      hasError: !!error,
      timestamp: new Date().toISOString(),
    });

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
    const noPkce = request.cookies.get('oauth_no_pkce')?.value === 'true';

    console.log('[OAuth Callback] Cookie check:', {
      hasCookieCodeVerifier: !!cookieCodeVerifier,
      hasCookieState: !!cookieState,
      hasCookieUserId: !!cookieUserId,
      stateMatch: state === cookieState,
      noPkce,
    });

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

    // Validar que tengamos el code_verifier (PKCE) - solo si no es modo no-pkce
    if (!noPkce && !cookieCodeVerifier) {
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
      console.log('[OAuth Callback] About to exchange code for token...');
      tokenData = await exchangeCodeForToken(code, cookieCodeVerifier || '');
      console.log('[OAuth Callback] Token exchange successful:', {
        userId: tokenData.user_id,
        expiresIn: tokenData.expires_in,
        accessTokenLength: tokenData.access_token?.length,
        refreshTokenLength: tokenData.refresh_token?.length,
      });
    } catch (tokenError) {
      console.error('[OAuth Callback] Token exchange error - FULL DETAILS:', {
        errorMessage: tokenError instanceof Error ? tokenError.message : String(tokenError),
        stack: tokenError instanceof Error ? tokenError.stack : undefined,
        code: code?.substring(0, 30) + '...',
        hasCodeVerifier: !!cookieCodeVerifier,
      });
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/configuracion?error=token_error&details=${encodeURIComponent(tokenError instanceof Error ? tokenError.message : 'Token exchange failed')}`,
      );
    }

    // Calcular fecha de expiración del token
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    console.log('[OAuth Callback] Preparing user update:', {
      userId: cookieUserId,
      mercadoPagoUserId: tokenData.user_id,
      expiresAt: expiresAt.toISOString(),
      tokenLength: tokenData.access_token?.length,
    });

    // Actualizar usuario en la base de datos
    try {
      console.log('[OAuth Callback] Starting prisma.user.update...');
      
      const updatedUser = await prisma.user.update({
        where: { id: cookieUserId },
        data: {
          wallet_linked: true,
          wallet_provider: 'mercado_pago',
          mercado_pago_user_id: String(tokenData.user_id),
          mercado_pago_access_token: tokenData.access_token,
          mercado_pago_refresh_token: tokenData.refresh_token,
          mercado_pago_token_expires_at: expiresAt,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          wallet_linked: true,
          wallet_provider: true,
          mercado_pago_user_id: true,
        },
      });

      console.log('[OAuth Callback] User updated successfully:', {
        userId: updatedUser.id,
        walletLinked: updatedUser.wallet_linked,
        mercadoPagoUserId: updatedUser.mercado_pago_user_id,
      });
    } catch (dbError) {
      console.error('[OAuth Callback] Database update error - FULL DETAILS:', {
        errorMessage: dbError instanceof Error ? dbError.message : String(dbError),
        errorCode: (dbError as any)?.code,
        errorMeta: (dbError as any)?.meta,
        userId: cookieUserId,
        stack: dbError instanceof Error ? dbError.stack : undefined,
      });
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/configuracion?error=db_error&details=${encodeURIComponent(dbError instanceof Error ? dbError.message : 'Unknown error')}`,
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
    response.cookies.delete('oauth_no_pkce');

    return response;
  } catch (error) {
    console.error('[OAuth Callback] Unexpected error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/configuracion?error=callback_error`,
    );
  }
}
