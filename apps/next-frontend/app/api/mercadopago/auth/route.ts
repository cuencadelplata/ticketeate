import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Buffer } from 'buffer';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Modo mock para desarrollo
    if (process.env.NODE_ENV === 'development' && process.env.MERCADOPAGO_MOCK === 'true') {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/api/mercadopago/mock-callback?userId=${session.user.id}`,
      );
    }

    const clientId = process.env.MERCADOPAGO_CLIENT_ID;
    const redirectUri = process.env.MERCADOPAGO_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      return NextResponse.json(
        { error: 'Configuración de Mercado Pago incompleta' },
        { status: 500 },
      );
    }

    // Generar state para seguridad
    const state = Buffer.from(JSON.stringify({ userId: session.user.id })).toString('base64');

    const authUrl = new URL('https://auth.mercadopago.com/authorization');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);

    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error('Error en OAuth de Mercado Pago:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
