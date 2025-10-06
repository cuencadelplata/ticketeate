import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Crea una preferencia de Checkout Pro en Mercado Pago y devuelve la URL para redirigir
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      title,
      quantity,
      unit_price,
      currency = 'ARS',
      metadata,
    }: {
      title: string;
      quantity: number;
      unit_price: number;
      currency?: 'ARS' | 'USD' | 'EUR';
      metadata?: Record<string, any>;
    } = body ?? {};

    if (!title || !quantity || !unit_price) {
      return NextResponse.json(
        { error: 'Faltan campos: title, quantity, unit_price' },
        { status: 400 },
      );
    }

    // Base URL para callback/back_urls
    const host =
      request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;

    const accessToken =
      process.env.MP_ACCESS_TOKEN ||
      'APP_USR-2616767994062884-100312-e0656821760e6ecbc6e885cd115f60ab-2609260829';
    if (!accessToken) {
      return NextResponse.json({ error: 'MP_ACCESS_TOKEN no configurado' }, { status: 500 });
    }

    // Mercado Pago Argentina opera en ARS. Si viene USD/EUR, convertimos a ARS
    const ratesToARS: Record<string, number> = { ARS: 1, USD: 1300, EUR: 1600 };
    const unitPriceARS = Number((unit_price * (ratesToARS[currency] || 1)).toFixed(2));

    const payload = {
      items: [
        {
          title,
          quantity,
          currency_id: 'ARS',
          unit_price: unitPriceARS,
        },
      ],
      back_urls: {
        success: `${baseUrl}/comprar?mp_status=success`,
        failure: `${baseUrl}/comprar?mp_status=failure`,
        pending: `${baseUrl}/comprar?mp_status=pending`,
      },
      // auto_return: 'approved', // algunos entornos dev rechazan auto_return si no reconocen back_urls
      metadata: metadata || {},
    };
    console.log('MP payload', payload);

    const url = 'https://api.mercadopago.com/checkout/preferences';
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error('MercadoPago error', resp.status, text);
      return NextResponse.json(
        { error: 'Error al crear preferencia', status: resp.status, detalle: text },
        { status: 500 },
      );
    }

    const data = await resp.json();
    return NextResponse.json(
      { id: data.id, init_point: data.init_point, sandbox_init_point: data.sandbox_init_point },
      { status: 201 },
    );
  } catch (e: any) {
    console.error('MP preference unexpected error', e);
    return NextResponse.json(
      { error: 'Error interno', detalle: e?.message || String(e) },
      { status: 500 },
    );
  }
}
