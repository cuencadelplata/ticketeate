import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Crea una preferencia de Checkout Pro con Marketplace Fee (10%)
 * @see https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/integrate-preferences
 */
export async function POST(request: NextRequest) {
  try {
    // Autenticar usuario
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const {
      items,
      external_reference,
      metadata,
    }: {
      items: Array<{
        title: string;
        quantity: number;
        unit_price: number;
        currency_id?: string;
      }>;
      external_reference: string;
      metadata?: Record<string, any>;
    } = body ?? {};

    // Validaciones
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Se requiere al menos un item' }, { status: 400 });
    }

    if (!external_reference) {
      return NextResponse.json({ error: 'Se requiere external_reference' }, { status: 400 });
    }

    // El organizador se obtiene del metadata (eventId)
    const eventId = metadata?.eventoid;
    if (!eventId) {
      return NextResponse.json({ error: 'Se requiere eventoid en metadata' }, { status: 400 });
    }

    // Obtener el evento y su organizador
    const event = await prisma.eventos.findUnique({
      where: { eventoid: eventId },
      select: {
        creadorid: true,
        titulo: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    // Obtener datos del organizador (vendedor) - NO del usuario autenticado
    const seller = await prisma.user.findUnique({
      where: { id: event.creadorid },
      select: {
        id: true,
        mercado_pago_user_id: true,
        mercado_pago_access_token: true,
        wallet_linked: true,
      },
    });

    if (!seller || !seller.wallet_linked || !seller.mercado_pago_access_token) {
      return NextResponse.json(
        { error: 'El organizador debe vincular su cuenta de Mercado Pago' },
        { status: 403 },
      );
    }

    // Calcular total y marketplace fee (10%)
    const total = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const marketplaceFee = Math.round(total * 0.1 * 100) / 100; // 10% redondeado a 2 decimales

    console.log('[Create Preference] Calculation:', {
      total,
      marketplaceFee,
      feePercentage: '10%',
      sellerId: seller.id,
      sellerMpUserId: seller.mercado_pago_user_id,
    });

    // Base URL para callbacks
    const host =
      request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;

    // Token de la plataforma (tu app)
    const platformAccessToken = process.env.MP_PLATFORM_ACCESS_TOKEN;
    if (!platformAccessToken) {
      console.error('[Create Preference] MP_PLATFORM_ACCESS_TOKEN no configurado');
      return NextResponse.json(
        { error: 'Configuración de plataforma incompleta' },
        { status: 500 },
      );
    }

    // Crear preference con marketplace_fee
    const preferencePayload = {
      items: items.map((item) => ({
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: item.currency_id || 'ARS',
      })),
      external_reference,
      marketplace_fee: marketplaceFee, // CLAVE: comisión que cobra la plataforma
      notification_url: `${baseUrl}/api/mercadopago/webhook`,
      back_urls: {
        success: `${baseUrl}/compra-exitosa?preference=${external_reference}`,
        failure: `${baseUrl}/compra-fallida`,
        pending: `${baseUrl}/compra-pendiente`,
      },
      auto_return: 'approved',
      metadata: {
        // Información del evento
        event_id: metadata?.event_id,
        event_titulo: metadata?.event_titulo,
        // Información del comprador
        buyer_id: metadata?.buyer_id,
        buyer_email: metadata?.buyer_email,
        buyer_nombre: metadata?.buyer_nombre,
        // Información del pedido
        cantidad: metadata?.cantidad,
        sector: metadata?.sector,
        precio_unitario: metadata?.precio_unitario,
        transaction_id: metadata?.transaction_id,
        // Información del vendedor/organizador
        seller_id: seller.id,
        seller_mp_user_id: seller.mercado_pago_user_id,
        marketplace_fee: marketplaceFee,
      },
    };

    console.log('[Create Preference] Request:', {
      url: 'https://api.mercadopago.com/checkout/preferences',
      itemsCount: items.length,
      total,
      marketplaceFee,
      external_reference,
    });

    // Crear preference con el token de la plataforma
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${platformAccessToken}`,
      },
      body: JSON.stringify(preferencePayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Create Preference] MercadoPago error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      return NextResponse.json(
        {
          error: 'Error al crear preferencia en MercadoPago',
          status: response.status,
          details: errorText,
        },
        { status: 500 },
      );
    }

    const preferenceData = await response.json();

    console.log('[Create Preference] Success:', {
      preferenceId: preferenceData.id,
      hasInitPoint: !!preferenceData.init_point,
      hasSandboxInitPoint: !!preferenceData.sandbox_init_point,
    });

    // Guardar order en la base de datos para tracking
    try {
      await prisma.mercadopago_orders.create({
        data: {
          preference_id: preferenceData.id,
          external_reference,
          seller_id: seller.id,
          seller_mp_user_id: seller.mercado_pago_user_id || null,
          amount: total,
          marketplace_fee: marketplaceFee,
          status: 'pending',
          metadata: {
            event_id: metadata?.event_id,
            event_titulo: metadata?.event_titulo,
            buyer_id: metadata?.buyer_id,
            buyer_email: metadata?.buyer_email,
            buyer_nombre: metadata?.buyer_nombre,
            cantidad: metadata?.cantidad,
            sector: metadata?.sector,
            precio_unitario: metadata?.precio_unitario,
            transaction_id: metadata?.transaction_id,
            seller_id: seller.id,
            seller_mp_user_id: seller.mercado_pago_user_id,
            marketplace_fee: marketplaceFee,
          },
        },
      });

      console.log('[Create Preference] Order saved to database:', {
        preferenceId: preferenceData.id,
        external_reference,
        sellerId: seller.id,
        buyerId: session.user.id,
      });
    } catch (dbError) {
      console.error('[Create Preference] Error saving order to database:', dbError);
      // No fallar la request si falla el guardado - la preferencia ya se creó
    }

    return NextResponse.json(
      {
        id: preferenceData.id,
        init_point: preferenceData.init_point,
        sandbox_init_point: preferenceData.sandbox_init_point,
        marketplace_fee: marketplaceFee,
        total,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('[Create Preference] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Error interno al crear preferencia',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
