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
async function createOrderTickets(order: any, preferenceDetails: any, buyerEmail?: string) {
  if (!preferenceDetails?.items || preferenceDetails.items.length === 0) {
    console.warn('[MP Webhook] Preference has no items');
    return;
  }

  // Obtener al comprador (por email si es disponible, o buscar si existe)
  let buyer = null;
  if (buyerEmail) {
    buyer = await prisma.user.findUnique({
      where: { email: buyerEmail },
    });
  }

  // Buscar al evento desde los metadatos
  const eventId = order.metadata?.eventId;
  if (!eventId) {
    console.error('[MP Webhook] No eventId in order metadata');
    return;
  }

  // Para cada item en la preferencia, crear las reservas y entradas
  for (const item of preferenceDetails.items) {
    try {
      // Obtener el stock de entradas para esta categoría
      const stockEntry = await prisma.stock_entrada.findFirst({
        where: {
          eventoid: eventId,
          nombre: item.title, // Simplificado - en prod deberías pasar el stock ID
        },
      });

      if (!stockEntry) {
        console.warn('[MP Webhook] Stock entry not found for item:', item.title);
        continue;
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

      // Si no hay buyer, crear un guest user o usar anonymous
      const usuarioId = buyer?.id || order.seller_id; // Fallback al vendedor si no hay buyer

      const reserva = await prisma.reservas.create({
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
          updated_by: order.seller_id,
        });
      }

      // Insertar todas las entradas en batch
      if (entradas.length > 0) {
        await prisma.entradas.createMany({
          data: entradas,
          skipDuplicates: true,
        });

        console.log('[MP Webhook] Created tickets:', {
          reservaId,
          entradaCount: entradas.length,
          eventId,
        });
      }
    } catch (itemError) {
      console.error('[MP Webhook] Error creating ticket for item:', {
        item: item.title,
        error: itemError,
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

    console.log('[MP Webhook] Notification received:', {
      timestamp: new Date().toISOString(),
      body: JSON.stringify(body, null, 2),
    });

    const { type, action, data } = body;

    // MercadoPago envía diferentes tipos de notificaciones
    // Nos interesan: "payment" y "merchant_order"
    if (type === 'payment' || action === 'payment.created' || action === 'payment.updated') {
      const paymentId = data?.id;

      if (!paymentId) {
        console.error('[MP Webhook] Missing payment ID');
        return NextResponse.json({ error: 'Missing payment ID' }, { status: 400 });
      }

      // Obtener detalles del pago desde la API de MercadoPago
      const platformAccessToken = process.env.MP_PLATFORM_ACCESS_TOKEN;
      if (!platformAccessToken) {
        console.error('[MP Webhook] MP_PLATFORM_ACCESS_TOKEN not configured');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
      }

      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${platformAccessToken}`,
        },
      });

      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text();
        console.error('[MP Webhook] Error fetching payment:', {
          status: paymentResponse.status,
          body: errorText,
        });
        return NextResponse.json({ error: 'Error fetching payment' }, { status: 500 });
      }

      const payment = await paymentResponse.json();

      console.log('[MP Webhook] Payment details:', {
        id: payment.id,
        status: payment.status,
        external_reference: payment.external_reference,
        transaction_amount: payment.transaction_amount,
        marketplace_fee: payment.fee_details?.find((f: any) => f.type === 'marketplace_fee')
          ?.amount,
      });

      // Buscar la orden en nuestra base de datos
      const order = await prisma.mercadopago_orders.findFirst({
        where: {
          external_reference: payment.external_reference,
        },
      });

      if (!order) {
        console.warn('[MP Webhook] Order not found for external_reference:', {
          external_reference: payment.external_reference,
        });
        // No fallar - puede ser una notificación válida para una orden que no guardamos
        return NextResponse.json({ received: true }, { status: 200 });
      }

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

      await prisma.mercadopago_orders.update({
        where: { id: order.id },
        data: {
          status: newStatus,
          payment_id: payment.id.toString(),
          merchant_order_id: payment.order?.id?.toString() || null,
          paid_at: isPaid ? new Date() : null,
          updated_at: new Date(),
        },
      });

      console.log('[MP Webhook] Order updated:', {
        orderId: order.id,
        preferenceId: order.preference_id,
        newStatus,
        isPaid,
        paymentId: payment.id,
      });

      // Lógica cuando el pago es aprobado
      if (isPaid) {
        console.log('[MP Webhook] Payment approved - Processing order:', {
          sellerId: order.seller_id,
          amount: order.amount,
          marketplaceFee: order.marketplace_fee,
          netAmount: Number(order.amount) - Number(order.marketplace_fee),
        });

        try {
          // Obtener los detalles de la preferencia para las entradas
          const preferenceDetails = await getPreferenceDetails(order.preference_id);

          if (preferenceDetails) {
            // Crear las entradas/reservas para el comprador
            await createOrderTickets(order, preferenceDetails, payment.payer?.email);

            console.log('[MP Webhook] Tickets created successfully for order:', {
              orderId: order.id,
              externalReference: order.external_reference,
            });
          }
        } catch (createTicketsError) {
          console.error('[MP Webhook] Error creating tickets:', createTicketsError);
          // No fallar la request - el pago ya se procesó correctamente
        }
      }

      return NextResponse.json(
        {
          received: true,
          orderId: order.id,
          status: newStatus,
        },
        { status: 200 },
      );
    }

    // Para otros tipos de notificaciones, simplemente confirmar recepción
    console.log('[MP Webhook] Unhandled notification type:', { type, action });
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('[MP Webhook] Unexpected error:', error);
    // Importante: Siempre retornar 200 para evitar que MercadoPago reintente indefinidamente
    // si el error no es recuperable
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
