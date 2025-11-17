import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import crypto from 'crypto';

/**
 * Genera un state aleatorio para proteger contra CSRF
 * @param userId El ID del usuario
 * @returns Un string aleatorio para estado
 */
function generateState(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * GET /api/mercadopago/auth-no-pkce
 * Versión SIN PKCE para testing - determinar si el problema es PKCE
 * TEMPORAL: usar solo para diagnóstico
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const clientId = process.env.MERCADOPAGO_CLIENT_ID;
    const redirectUri = process.env.MERCADOPAGO_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      console.error(
        '[OAuth Auth No PKCE] Missing configuration:',
        { clientId: !!clientId, redirectUri: !!redirectUri },
      );
      return NextResponse.json(
        { error: 'Configuración de Mercado Pago incompleta' },
        { status: 500 },
      );
    }

    const state = generateState();

    // Crear la URL de autorización SIN PKCE
    const authUrl = new URL('https://auth.mercadopago.com/authorization');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('platform_id', 'mp');

    console.log('[OAuth Auth No PKCE] Authorization URL generated:', {
      userId: session.user.id,
      clientId,
      redirectUri,
      hasPKCE: false,
      url: authUrl.toString(),
    });

    // Guardar en cookie el state y user_id para usar en el callback
    const response = NextResponse.redirect(authUrl.toString());
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
    response.cookies.set('oauth_no_pkce', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutos
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[OAuth Auth No PKCE] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    );
  }
}
