import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { title, quantity, unit_price, currency, metadata } = body ?? {};
    if (!title || !quantity || !unit_price || !currency) {
      return NextResponse.json({ error: 'Faltan campos' }, { status: 400 });
    }

    const secret =
      process.env.STRIPE_SECRET_KEY ||
      'sk_test_51SFKVXHNhtfc3l4tBkwh0k9zxH1bU4YnKuFPF9ELGO6Y742SrmHtM1tWbKNmAOJHwZS1U1FQmI37dZY6Eh1pfSPo00Xilv8ndI';
    const publishableKey =
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
      'pk_test_51SFKVXHNhtfc3l4tJCy8rz4F8zHANx6pwc4hXeGsyMJP8ts098KCKN2AfGCLUdHVqqYyuUIpq1BOzhVQkwob8Ihx00onYuGaUz';
    if (!secret || !publishableKey) {
      return NextResponse.json({ error: 'Stripe keys no configuradas' }, { status: 500 });
    }

    // Crear sesión via API REST (evita instalar sdk en serverless)
    const host =
      request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;

    // Construir URLs con el evento incluido si está disponible en metadata
    const eventParam = metadata?.eventoid ? `&evento=${metadata.eventoid}` : '';
    
    const payload = {
      mode: 'payment',
      success_url: `${baseUrl}/comprar?stripe_status=success${eventParam}`,
      cancel_url: `${baseUrl}/comprar?stripe_status=cancel${eventParam}`,
      line_items: [
        {
          price_data: {
            currency: String(currency).toLowerCase(),
            product_data: { name: title },
            unit_amount: Math.round(Number(unit_price) * 100),
          },
          quantity: Number(quantity),
        },
      ],
    };

    // Construir cuerpo x-www-form-urlencoded con claves anidadas que espera Stripe
    const form = new URLSearchParams();
    form.append('mode', 'payment');
    form.append('success_url', `${baseUrl}/comprar?stripe_status=success${eventParam}`);
    form.append('cancel_url', `${baseUrl}/comprar?stripe_status=cancel${eventParam}`);
    form.append('line_items[0][price_data][currency]', String(currency).toLowerCase());
    form.append(
      'line_items[0][price_data][unit_amount]',
      String(Math.round(Number(unit_price) * 100)),
    );
    form.append('line_items[0][price_data][product_data][name]', title);
    form.append('line_items[0][quantity]', String(Number(quantity)));
    
    // Agregar metadata si está presente
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        form.append(`metadata[${key}]`, String(value));
      });
    }

    const resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error('Stripe error', resp.status, text);
      return NextResponse.json(
        { error: 'No se pudo crear sesión de Stripe', detalle: text },
        { status: 500 },
      );
    }

    const data = await resp.json();
    // Preferimos url de redirección
    return NextResponse.json({ id: data.id, url: data.url || data.payment_url }, { status: 201 });
  } catch (e: any) {
    console.error('Stripe unexpected', e);
    return NextResponse.json(
      { error: 'Error interno', detalle: e?.message || String(e) },
      { status: 500 },
    );
  }
}
