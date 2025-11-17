import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/db';
import crypto from 'crypto';

/**
 * Obtiene los detalles de una preferencia desde la API de Mercado Pago
 */
async function getPreferenceDetails(preferenceId: string) {
  const platformAccessToken = process.env.MP_PLATFORM_ACCESS_TOKEN;
  if (!platformAccessToken) {
    throw new Error('MP_PLATFORM_ACCESS_TOKEN not configured');
  }

  const response = await fetch(`https://api.mercadopago.com/checkout/preferences/${preferenceId}`, {
    headers: {
      Authorization: `Bearer ${platformAccessToken}`,
    },
  });

  if (!response.ok) {
    console.error('[MP Webhook] Error fetching preference:', {
      status: response.status,
      preferenceId,
    });
    return null;
  }

  return response.json();
}

/**
 * Genera un número aleatorio para el código QR
 */
function generateQRCode(): string {
  return crypto.randomBytes(16).toString('hex').toUpperCase();
}

/**
 * Crea las entradas (reservas y códigos QR) cuando un pago es aprobado
 */
async function createOrderTickets(
  metadata: Record<string, any>,
  preferenceDetails: any,
  sellerId: string,
) {
  if (!preferenceDetails?.items || preferenceDetails.items.length === 0) {
    console.warn('[MP Webhook] Preference has no items');
    return;
  }

  // Obtener al comprador desde la metadata
  const buyerEmail = metadata.buyer_email;
  const eventId = metadata.event_id;
  const cantidad = metadata.cantidad;
  const sector = metadata.sector;

  if (!eventId) {
    console.error('[MP Webhook] No eventId in metadata');
    return;
  }

  console.log('[MP Webhook] Creating tickets with metadata:', {
    eventId,
    buyerEmail,
    cantidad,
    sector,
  });

  // Obtener al comprador por email
  let buyer = null;
  if (buyerEmail) {
    buyer = await prisma.user.findUnique({
      where: { email: buyerEmail },
      select: { id: true, name: true, email: true },
    });
    console.log('[MP Webhook] Buyer lookup:', {
      email: buyerEmail,
      found: !!buyer,
      buyerId: buyer?.id,
    });
  }

  // Para cada item en la preferencia, crear las reservas y entradas
  for (const item of preferenceDetails.items) {
    try {
      // Obtener el stock de entradas - buscar por nombre del item
      let stockEntry = await prisma.stock_entrada.findFirst({
        where: {
          eventoid: eventId,
          // El nombre debería coincidir con el título del item
          // En este caso: "Nombre del evento - sector"
        },
        orderBy: { stockid: 'asc' },
      });

      if (!stockEntry) {
        console.warn('[MP Webhook] Stock entry not found for event:', {
          eventId,
          itemTitle: item.title,
        });
        // Intentar obtener cualquier stock disponible para este evento
        const fallbackStock = await prisma.stock_entrada.findFirst({
          where: { eventoid: eventId },
          orderBy: { stockid: 'asc' },
        });

        if (!fallbackStock) {
          console.error('[MP Webhook] No stock entries found for event:', eventId);
          continue;
        }

        stockEntry = fallbackStock;
      }

      // Crear la reserva
      const reservaId = crypto.randomUUID();

      const fechaEvento = await prisma.fechas_evento.findFirst({
        where: { eventoid: eventId },
        orderBy: { fecha_hora: 'asc' },
      });

      if (!fechaEvento) {
        console.warn('[MP Webhook] Event date not found for event:', eventId);
        continue;
      }

      // Usuario de la reserva: el comprador si existe, sino crear un registro temporal
      const usuarioId = buyer?.id || metadata.buyer_id;

      await prisma.reservas.create({
        data: {
          reservaid: reservaId,
          usuarioid: usuarioId,
          eventoid: eventId,
          fechaid: fechaEvento.fechaid,
          categoriaid: stockEntry.stockid,
          cantidad: item.quantity,
          estado: 'CONFIRMADA',
          version: 1,
          is_active: true,
        },
      });

      console.log('[MP Webhook] Reserva created:', {
        reservaId,
        usuarioId,
        eventId,
        cantidad: item.quantity,
      });

      // Crear las entradas individuales con códigos QR
      const entradas = [];
      for (let i = 0; i < item.quantity; i++) {
        const entradaId = crypto.randomUUID();
        const codigoQr = generateQRCode();

        entradas.push({
          entradaid: entradaId,
          reservaid: reservaId,
          codigo_qr: codigoQr,
          estado: 'VALIDA',
          version: 1,
          is_active: true,
          updated_by: sellerId,
        });
      }

      // Insertar todas las entradas en batch
      if (entradas.length > 0) {
        await prisma.entradas.createMany({
          data: entradas,
          skipDuplicates: true,
        });

        console.log('[MP Webhook] ✅ Created tickets:', {
          reservaId,
          entradaCount: entradas.length,
          eventId,
          buyerEmail,
        });
      }
    } catch (itemError) {
      console.error('[MP Webhook] Error creating ticket for item:', {
        item: item.title,
        error: itemError instanceof Error ? itemError.message : String(itemError),
      });
      // Continuar con el siguiente item
    }
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Webhook para recibir notificaciones de MercadoPago
 * @see https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    console.log('[MP Webhook] ===== NOTIFICATION RECEIVED =====');
    console.log('[MP Webhook] Body:', JSON.stringify(body, null, 2));

    const { type, action, data } = body;

    console.log('[MP Webhook] Processing:', {
      type,
      action,
      paymentId: data?.id,
      timestamp: new Date().toISOString(),
    });

    // MercadoPago envía diferentes tipos de notificaciones
    // Nos interesan: type=payment (cuando el estado cambia)
    // action puede ser: payment.created (pending), payment.updated (cambios de estado)
    if (type !== 'payment') {
      console.log('[MP Webhook] ⚠️  Ignoring notification - type:', type);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const paymentId = data?.id;

    if (!paymentId) {
      console.error('[MP Webhook] ❌ Missing payment ID');
      return NextResponse.json({ error: 'Missing payment ID' }, { status: 400 });
    }

    // Obtener detalles del pago desde la API de MercadoPago
    const platformAccessToken = process.env.MP_PLATFORM_ACCESS_TOKEN;
    if (!platformAccessToken) {
      console.error('[MP Webhook] ❌ MP_PLATFORM_ACCESS_TOKEN not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    console.log('[MP Webhook] Fetching payment details from MP API...');
    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${platformAccessToken}`,
      },
    });

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      console.error('[MP Webhook] ❌ Error fetching payment:', {
        status: paymentResponse.status,
        body: errorText,
      });
      return NextResponse.json({ error: 'Error fetching payment' }, { status: 500 });
    }

    const payment = await paymentResponse.json();

    console.log('[MP Webhook] Payment details fetched:', {
      id: payment.id,
      status: payment.status,
      external_reference: payment.external_reference,
      transaction_amount: payment.transaction_amount,
      payer_email: payment.payer?.email,
      metadata: payment.metadata,
    });

    // Extraer metadata directamente del pago
    const metadata = payment.metadata || {};
    const eventId = metadata.event_id;
    const buyerEmail = metadata.buyer_email || payment.payer?.email;
    const buyerNombre = metadata.buyer_nombre || payment.payer?.first_name || '';
    const sellerId = metadata.seller_id;
    const sellerMpUserId = metadata.seller_mp_user_id;

    if (!eventId) {
      console.error('[MP Webhook] ❌ No eventId in payment metadata');
      return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
    }

    if (!sellerId) {
      console.error('[MP Webhook] ❌ No sellerId in payment metadata');
      return NextResponse.json({ error: 'Missing sellerId' }, { status: 400 });
    }

    console.log('[MP Webhook] Metadata extracted:', {
      eventId,
      buyerEmail,
      buyerNombre,
      sellerId,
      cantidad: metadata.cantidad,
      sector: metadata.sector,
    });

    // Actualizar estado de la orden según el estado del pago
    const statusMap: Record<string, string> = {
      approved: 'approved',
      pending: 'pending',
      in_process: 'processing',
      rejected: 'rejected',
      cancelled: 'cancelled',
      refunded: 'refunded',
      charged_back: 'charged_back',
    };

    const newStatus = statusMap[payment.status] || 'unknown';
    const isPaid = payment.status === 'approved';

    // Actualizar la orden en la BD si existe
    const existingOrder = await prisma.mercadopago_orders.findFirst({
      where: {
        external_reference: payment.external_reference,
      },
    });

    if (existingOrder) {
      await prisma.mercadopago_orders.update({
        where: { id: existingOrder.id },
        data: {
          status: newStatus,
          payment_id: payment.id.toString(),
          merchant_order_id: payment.order?.id?.toString() || null,
          paid_at: isPaid ? new Date() : null,
          updated_at: new Date(),
        },
      });

      console.log('[MP Webhook] Order status updated:', {
        orderId: existingOrder.id,
        preferenceId: existingOrder.preference_id,
        oldStatus: existingOrder.status,
        newStatus,
        isPaid,
      });
    } else {
      console.warn('[MP Webhook] ⚠️  Order not found in database for external_reference:', {
        external_reference: payment.external_reference,
      });
    }

    // Lógica cuando el pago es aprobado
    if (isPaid) {
      console.log('[MP Webhook] 🎉 Payment APPROVED - Creating tickets:', {
        eventId,
        sellerId,
        amount: payment.transaction_amount,
        buyerEmail,
      });

      try {
        // Obtener los detalles de la preferencia para las entradas
        const preferenceId = existingOrder?.preference_id;
        if (!preferenceId) {
          console.error('[MP Webhook] ❌ No preference_id found');
          return NextResponse.json(
            {
              received: true,
              orderId: existingOrder?.id,
              status: newStatus,
              isPaid,
              error: 'No preference_id',
            },
            { status: 200 },
          );
        }

        console.log('[MP Webhook] Fetching preference details:', preferenceId);
        const preferenceDetails = await getPreferenceDetails(preferenceId);

        if (preferenceDetails) {
          console.log('[MP Webhook] Preference details received, creating tickets...');
          // Crear las entradas/reservas para el comprador
          await createOrderTickets(metadata, preferenceDetails, sellerId);

          console.log('[MP Webhook] ✅ TICKETS CREATED SUCCESSFULLY:', {
            orderId: existingOrder?.id,
            externalReference: payment.external_reference,
            eventId,
          });
        } else {
          console.warn('[MP Webhook] ⚠️  Could not get preference details');
        }
      } catch (createTicketsError) {
        console.error('[MP Webhook] ❌ Error creating tickets:', {
          error:
            createTicketsError instanceof Error
              ? createTicketsError.message
              : String(createTicketsError),
          stack: createTicketsError instanceof Error ? createTicketsError.stack : undefined,
        });
        // No fallar la request - el pago ya se procesó correctamente
      }
    } else {
      console.log('[MP Webhook] ⏳ Payment not approved yet:', {
        paymentStatus: payment.status,
        externalReference: payment.external_reference,
      });
    }

    return NextResponse.json(
      {
        received: true,
        status: newStatus,
        isPaid,
        eventId,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[MP Webhook] ❌ Unexpected error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    // Importante: Siempre retornar 200 para evitar que MercadoPago reintente indefinidamente
    return NextResponse.json(
      {
        received: true,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 200 },
    );
  }
}

/**
 * GET endpoint para verificar que el webhook está activo
 */
export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/mercadopago/webhook',
    timestamp: new Date().toISOString(),
  });
}
