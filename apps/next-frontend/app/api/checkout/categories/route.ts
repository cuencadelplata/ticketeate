import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/checkout/categories
 * Obtiene las categorías de entradas disponibles para un evento
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

    // Verificar que el evento existe
    const event = await prisma.eventos.findUnique({
      where: { eventoid: eventId },
      select: { eventoid: true },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Obtener las categorías de stock del evento
    const categories = await prisma.stock_entrada.findMany({
      where: { eventoid: eventId },
      select: {
        stockid: true,
        nombre: true,
        precio: true,
        cant_max: true,
        fecha_limite: true,
      },
    });

    if (categories.length === 0) {
      return NextResponse.json({
        eventId,
        categories: [],
        total_categories: 0,
      });
    }

    // Contar vendidas por categoría para calcular disponibles
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

    const categoriesWithAvailable = categories.map((cat) => ({
      id: cat.stockid,
      name: cat.nombre,
      price: Number(cat.precio) / 100, // Convertir de centavos a pesos
      stock: cat.cant_max,
      available: Math.max(0, cat.cant_max - (salesMap.get(cat.stockid) || 0)),
      expiration_date: cat.fecha_limite.toISOString(),
    }));

    return NextResponse.json({
      eventId,
      categories: categoriesWithAvailable,
      total_categories: categoriesWithAvailable.length,
    });
  } catch (error) {
    console.error('[Checkout Categories] Error:', error);
    return NextResponse.json(
      {
        error: 'Error fetching ticket categories',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
