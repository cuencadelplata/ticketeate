import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/mercadopago/orders
 * Obtiene las órdenes de marketplace del organizador autenticado
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Construir filtros
    const where: any = {
      seller_id: session.user.id,
    };

    if (status) {
      where.status = status;
    }

    // Obtener órdenes con paginación
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

    console.log('[MP Orders] Query successful:', {
      sellerId: session.user.id,
      total,
      returned: orders.length,
      status: status || 'all',
    });

    return NextResponse.json(
      {
        orders,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + orders.length < total,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[MP Orders] Error:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener órdenes',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
