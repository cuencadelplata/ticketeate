import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/checkout/tickets
 * Obtiene las entradas (tickets) compradas por el usuario
 *
 * Query params:
 *   - eventId: string (opcional, para filtrar por evento)
 *   - status: 'VALIDA' | 'USADA' | 'CANCELADA' | 'all' (default: all)
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
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Obtener todas las entradas del usuario
    const tickets = await prisma.entradas.findMany({
      where: {
        reservas: {
          usuarioid: session.user.id,
          ...(eventId && { eventoid: eventId }),
        },
        ...(status && status !== 'all' && { estado: status }),
      },
      include: {
        reservas: {
          include: {
            eventos: {
              select: {
                titulo: true,
                eventoid: true,
                ubicacion: true,
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
        },
      },
      orderBy: {
        updated_at: 'desc',
      },
      take: limit,
      skip: offset,
    });

    const total = await prisma.entradas.count({
      where: {
        reservas: {
          usuarioid: session.user.id,
          ...(eventId && { eventoid: eventId }),
        },
        ...(status && status !== 'all' && { estado: status }),
      },
    });

    // Formatear respuesta
    const formattedTickets = tickets.map((ticket) => ({
      id: ticket.entradaid,
      reservaId: ticket.reservas[0]?.reservaid,
      qrCode: ticket.codigo_qr,
      status: ticket.estado,
      event: {
        id: ticket.reservas[0]?.eventos.eventoid,
        title: ticket.reservas[0]?.eventos.titulo,
        location: ticket.reservas[0]?.eventos.ubicacion,
        date: ticket.reservas[0]?.fechas_evento.fecha_hora.toISOString(),
      },
      category: {
        name: ticket.reservas[0]?.stock_entrada.nombre,
        price: Number(ticket.reservas[0]?.stock_entrada.precio || 0) / 100,
      },
      createdAt: ticket.updated_at.toISOString(),
      usedAt: ticket.updated_at.toISOString(), // cuando fue validada
    }));

    return NextResponse.json({
      buyer: {
        id: session.user.id,
        email: session.user.email,
      },
      tickets: formattedTickets,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('[Checkout Tickets] Error:', error);
    return NextResponse.json(
      {
        error: 'Error fetching tickets',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
