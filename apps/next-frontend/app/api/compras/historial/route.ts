import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const usuarioid = searchParams.get('usuario_id');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '12'));
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    if (!usuarioid) {
      return NextResponse.json({ error: 'usuario_id es requerido' }, { status: 400 });
    }

    const offset = (page - 1) * limit;

    // Build filters for historial_compras
    const where: any = {
      usuarioid: String(usuarioid),
    };
    if (status) {
      where.estado_compra = status;
    }

    // Get total count
    const total = await prisma.historial_compras.count({ where });

    // Fetch paginated data
    const compras = await prisma.historial_compras.findMany({
      where,
      orderBy: {
        fecha_compra: 'desc',
      },
      skip: offset,
      take: limit,
    });

    // Fetch event details separately to avoid relational filtering issues
    const purchases = await Promise.all(
      compras.map(async (compra) => {
        const evento = await prisma.eventos.findUnique({
          where: { eventoid: compra.eventoid },
          select: {
            titulo: true,
            ubicacion: true,
            imagenes_evento: {
              select: { url: true },
              take: 1,
            },
          },
        });

        return {
          id: compra.id,
          eventoid: compra.eventoid,
          eventName: evento?.titulo || 'Evento',
          eventImage: evento?.imagenes_evento[0]?.url || null,
          ticketCount: compra.cantidad,
          totalPrice: Number(compra.monto_total),
          currency: compra.moneda,
          status: compra.estado_compra,
          purchaseDate: compra.fecha_compra?.toISOString() || null,
          eventDate: compra.fecha_evento?.toISOString() || null,
          receiptUrl: compra.comprobante_url,
          ticketType: 'General',
          venue: evento?.ubicacion || 'Ubicación no disponible',
        };
      }),
    );

    return NextResponse.json({
      success: true,
      compras: purchases,
      pagination: {
        page,
        limit,
        total,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error consultando historial de compras:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
