import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/checkout/orders
 * Obtiene el historial de órdenes del usuario comprador
 *
 * Query params:
 *   - status: 'pending' | 'approved' | 'rejected' | 'all' (default: all)
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
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Buscar órdenes donde el usuario es el comprador (en metadata.buyerId)
    // También buscar sus reservas confirmadas
    const [orders, reservas, total] = await Promise.all([
      prisma.mercadopago_orders.findMany({
        where: {
          metadata: {
            path: ['buyerId'],
            equals: session.user.id,
          },
          ...(status && status !== 'all' && { status }),
        },
        orderBy: {
          created_at: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.reservas.findMany({
        where: {
          usuarioid: session.user.id,
          estado: 'CONFIRMADA',
        },
        include: {
          eventos: {
            select: {
              titulo: true,
              eventoid: true,
            },
          },
          stock_entrada: {
            select: {
              nombre: true,
              precio: true,
            },
          },
          fechas_evento: {
            select: {
              fecha_hora: true,
            },
          },
        },
        orderBy: {
          fecha_reserva: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.mercadopago_orders.count({
        where: {
          metadata: {
            path: ['buyerId'],
            equals: session.user.id,
          },
          ...(status && status !== 'all' && { status }),
        },
      }),
    ]);

    // Formatear respuesta
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      preferenceId: order.preference_id,
      externalReference: order.external_reference,
      amount: Number(order.amount),
      marketplaceFee: Number(order.marketplace_fee),
      status: order.status,
      paymentId: order.payment_id,
      createdAt: order.created_at.toISOString(),
      paidAt: order.paid_at?.toISOString() || null,
      metadata: order.metadata,
    }));

    const formattedReservas = reservas.map((reserva) => ({
      id: reserva.reservaid,
      eventId: reserva.eventoid,
      eventTitle: reserva.eventos.titulo,
      categoryName: reserva.stock_entrada.nombre,
      quantity: reserva.cantidad,
      price: Number(reserva.stock_entrada.precio) / 100,
      totalPrice: (Number(reserva.stock_entrada.precio) / 100) * reserva.cantidad,
      eventDate: reserva.fechas_evento.fecha_hora.toISOString(),
      reservedAt: reserva.fecha_reserva.toISOString(),
      status: reserva.estado,
    }));

    return NextResponse.json({
      buyer: {
        id: session.user.id,
        email: session.user.email,
      },
      orders: formattedOrders,
      reservas: formattedReservas,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('[Checkout Orders] Error:', error);
    return NextResponse.json(
      {
        error: 'Error fetching orders',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
