import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import crypto from 'crypto';

/**
 * Genera un code_verifier para PKCE (recomendado para mayor seguridad)
 * @returns Un string aleatorio de 128 caracteres válido para PKCE
 */
function generateCodeVerifier(): string {
  return crypto.randomBytes(64).toString('hex').slice(0, 128);
}

/**
 * Genera un code_challenge a partir del code_verifier
 * @param verifier El code_verifier generado
 * @returns El code_challenge codificado en base64url
 */
function generateCodeChallenge(verifier: string): string {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

/**
 * Genera un state aleatorio para proteger contra CSRF
 * @param userId El ID del usuario
 * @returns Un string aleatorio para estado
 */
function generateState(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Modo mock para desarrollo/testing
    if (process.env.NODE_ENV === 'development' && process.env.MERCADO_PAGO_MOCK === 'true') {
      console.log('[OAuth Auth] Mock mode enabled, redirecting to mock callback');
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/api/mercadopago/mock-callback?userId=${session.user.id}`,
      );
    }

    const clientId = process.env.MERCADOPAGO_CLIENT_ID;
    const redirectUri = process.env.MERCADOPAGO_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      console.error('[OAuth Auth] Missing configuration:', {
        clientId: !!clientId,
        redirectUri: !!redirectUri,
      });
      return NextResponse.json(
        { error: 'Configuración de Mercado Pago incompleta' },
        { status: 500 },
      );
    }

    // Generar PKCE parameters (recomendado por Mercado Pago)
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = generateState();

    // Crear la URL de autorización
    const authUrl = new URL('https://auth.mercadopago.com/authorization');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('platform_id', 'mp'); // Requerido según documentación MP
    // PKCE para mayor seguridad
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');

    console.log('[OAuth Auth] Authorization URL parameters:', {
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      has_state: !!state,
      has_code_challenge: !!codeChallenge,
      platform_id: 'mp',
    });

    // Guardar en cookie el code_verifier y state para usar en el callback
    // Usar secure=true, httpOnly=true, sameSite=strict en producción
    const response = NextResponse.redirect(authUrl.toString());
    response.cookies.set('oauth_code_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutos
      path: '/',
    });
    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutos
      path: '/',
    });
    response.cookies.set('oauth_user_id', session.user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutos
      path: '/',
    });

    console.log('[OAuth Auth] Authorization URL generated successfully', {
      userId: session.user.id,
      hasPKCE: true,
    });

    return response;
  } catch (error) {
    console.error('[OAuth Auth] Unexpected error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
