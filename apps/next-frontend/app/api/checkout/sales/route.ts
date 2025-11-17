import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/checkout/sales
 * Obtiene las ventas (órdenes) del organizador autenticado
 *
 * Query params:
 *   - eventId: string (opcional)
 *   - status: 'pending' | 'approved' | 'rejected' | 'all' (default: approved)
 *   - limit: número (default: 50)
 *   - offset: número (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const status = searchParams.get('status') || 'approved';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Buscar órdenes donde el usuario (organizador) es el vendedor
    const where: any = {
      seller_id: session.user.id,
      ...(status !== 'all' && { status }),
    };

    if (eventId) {
      where.metadata = {
        path: ['eventId'],
        equals: eventId,
      };
    }

    const [orders, total] = await Promise.all([
      prisma.mercadopago_orders.findMany({
        where,
        orderBy: {
          created_at: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.mercadopago_orders.count({ where }),
    ]);

    // Obtener datos de los eventos para cada orden
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const metadata = order.metadata as Record<string, any> | null;
        const event = metadata?.eventId
          ? await prisma.eventos.findUnique({
              where: { eventoid: metadata.eventId as string },
              select: {
                titulo: true,
                eventoid: true,
              },
            })
          : null;

        return {
          id: order.id,
          preferenceId: order.preference_id,
          externalReference: order.external_reference,
          buyerId: metadata?.buyerId,
          eventId: metadata?.eventId,
          eventTitle: event?.titulo || 'Evento desconocido',
          amount: Number(order.amount),
          marketplaceFee: Number(order.marketplace_fee),
          sellerAmount: Number(order.amount) - Number(order.marketplace_fee),
          status: order.status,
          paymentId: order.payment_id,
          createdAt: order.created_at.toISOString(),
          paidAt: order.paid_at?.toISOString() || null,
          metadata: order.metadata,
        };
      }),
    );

    // Calcular totales
    const totalRevenue = ordersWithDetails
      .filter((o) => o.status === 'approved')
      .reduce((sum, o) => sum + o.sellerAmount, 0);

    const totalFees = ordersWithDetails
      .filter((o) => o.status === 'approved')
      .reduce((sum, o) => sum + o.marketplaceFee, 0);

    return NextResponse.json({
      organizer: {
        id: session.user.id,
        email: session.user.email,
      },
      sales: ordersWithDetails,
      summary: {
        totalOrders: total,
        approvedOrders: ordersWithDetails.filter((o) => o.status === 'approved').length,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalFees: Number(totalFees.toFixed(2)),
      },
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('[Checkout Sales] Error:', error);
    return NextResponse.json(
      {
        error: 'Error fetching sales',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
