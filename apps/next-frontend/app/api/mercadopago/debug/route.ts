import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/mercadopago/debug
 * Endpoint para diagnosticar problemas de configuración de Mercado Pago
 * SOLO PARA DESARROLLO - remover en producción
 */
export async function GET(request: NextRequest) {
  // Solo permitir en desarrollo o con un secret especial
  const debugSecret = request.headers.get('x-debug-secret');
  const isDevMode = process.env.NODE_ENV === 'development';
  const hasValidSecret = debugSecret === process.env.SERVICE_AUTH_SECRET;

  if (!isDevMode && !hasValidSecret) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  return NextResponse.json(
    {
      environment: process.env.NODE_ENV,
      mercadoPago: {
        CLIENT_ID: process.env.MERCADOPAGO_CLIENT_ID ? '✓ SET' : '✗ MISSING',
        CLIENT_SECRET: process.env.MERCADOPAGO_CLIENT_SECRET ? '✓ SET' : '✗ MISSING',
        REDIRECT_URI: process.env.MERCADOPAGO_REDIRECT_URI || '✗ MISSING',
        PUBLIC: process.env.MERCADOPAGO_PUBLIC ? '✓ SET' : '✗ MISSING',
        ACCESS: process.env.MERCADOPAGO_ACCESS ? '✓ SET' : '✗ MISSING',
        WEBHOOK_SECRET: process.env.MERCADOPAGO_WEBHOOK_SECRET ? '✓ SET' : '✗ MISSING',
      },
      auth: {
        BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ? '✓ SET' : '✗ MISSING',
        BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || '✗ MISSING',
        SERVICE_AUTH_SECRET: process.env.SERVICE_AUTH_SECRET ? '✓ SET' : '✗ MISSING',
      },
      api: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '✗ MISSING',
        NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || '✗ MISSING',
      },
      details: isDevMode
        ? {
            MERCADOPAGO_CLIENT_ID: process.env.MERCADOPAGO_CLIENT_ID?.substring(0, 10) + '...',
            MERCADO_PAGO_REDIRECT_URI: process.env.MERCADO_PAGO_REDIRECT_URI,
            NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
          }
        : {},
    },
    { status: 200 },
  );
}
