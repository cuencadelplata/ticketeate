import { NextRequest, NextResponse } from 'next/server';

/**
 * Obtiene un token de aplicación usando Client Credentials Flow
 * Este token se usa para acceder a recursos de tu aplicación en Mercado Pago
 * No requiere interacción del usuario
 * @see https://developers.mercadopago.com/es/docs/advanced-payments/oauth/client-credentials
 */
async function getApplicationToken(): Promise<{
  access_token: string;
  expires_in: number;
  token_type: string;
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
      grant_type: 'client_credentials',
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error('[App Token] Token fetch failed:', {
      status: tokenResponse.status,
      statusText: tokenResponse.statusText,
      body: errorText,
    });
    throw new Error(`App token fetch failed: ${tokenResponse.status} - ${errorText}`);
  }

  const tokenData = await tokenResponse.json();

  if (!tokenData.access_token) {
    throw new Error('Invalid app token response from Mercado Pago');
  }

  return {
    access_token: tokenData.access_token,
    expires_in: tokenData.expires_in || 21600, // 6 horas por defecto
    token_type: tokenData.token_type || 'Bearer',
  };
}

/**
 * GET /api/mercadopago/app-token
 * Obtiene un token de aplicación para acceder a la API de Mercado Pago
 * Este endpoint es para uso interno (backend-to-backend)
 * NO debe ser accesible desde el frontend sin autenticación
 */
export async function GET(request: NextRequest) {
  try {
    // En producción, deberías validar que esta llamada viene de tu propio backend
    // Puedes usar un secret compartido o verificar el origen de la solicitud
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.SERVICE_AUTH_SECRET;

    if (!authHeader || !expectedSecret) {
      console.warn('[App Token] Missing authentication or secret');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Validar que el secret sea correcto (Bearer token)
    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || token !== expectedSecret) {
      console.warn('[App Token] Invalid authentication token');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener el token de aplicación
    const appToken = await getApplicationToken();

    console.log('[App Token] Application token generated successfully');

    return NextResponse.json(
      {
        access_token: appToken.access_token,
        token_type: appToken.token_type,
        expires_in: appToken.expires_in,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
          Pragma: 'no-cache',
        },
      },
    );
  } catch (error) {
    console.error('[App Token] Unexpected error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
