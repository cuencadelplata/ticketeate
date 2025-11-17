import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/db';

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

      // TODO: Aquí puedes agregar lógica adicional según el estado
      // Por ejemplo, enviar emails, actualizar tickets, notificar al vendedor, etc.
      if (isPaid) {
        console.log('[MP Webhook] Payment approved - add custom logic here:', {
          sellerId: order.seller_id,
          amount: order.amount,
          marketplaceFee: order.marketplace_fee,
          netAmount: Number(order.amount) - Number(order.marketplace_fee),
        });

        // Ejemplo: Podrías llamar a un servicio para crear las entradas del evento
        // await createTicketsForOrder(order);
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
