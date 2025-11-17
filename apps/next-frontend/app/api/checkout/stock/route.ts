import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/checkout/stock
 * Obtiene el stock actual disponible para un evento
 *
 * Query params:
 *   - eventId: string (requerido)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // Obtener el stock
    const stock = await prisma.stock_entrada.findMany({
      where: { eventoid: eventId },
    });

    if (stock.length === 0) {
      return NextResponse.json({
        eventId,
        stock: [],
        timestamp: new Date().toISOString(),
      });
    }

    // Contar vendidas por categoría (reservas confirmadas)
    const sales = await prisma.reservas.groupBy({
      by: ['categoriaid'],
      where: {
        eventoid: eventId,
        estado: 'CONFIRMADA',
      },
      _sum: {
        cantidad: true,
      },
    });

    const salesMap = new Map(sales.map((s) => [s.categoriaid, s._sum.cantidad || 0]));

    const stockWithAvailable = stock.map((s) => ({
      id: s.stockid,
      name: s.nombre,
      price: Number(s.precio) / 100,
      total: s.cant_max,
      sold: salesMap.get(s.stockid) || 0,
      available: Math.max(0, s.cant_max - (salesMap.get(s.stockid) || 0)),
    }));

    return NextResponse.json({
      eventId,
      stock: stockWithAvailable,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Checkout Stock] Error:', error);
    return NextResponse.json(
      {
        error: 'Error fetching stock information',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
