import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const clientId = process.env.MERCADO_PAGO_CLIENT_ID;
    const redirectUri = process.env.MERCADO_PAGO_REDIRECT_URI;

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
