import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/db';

interface Ticket {
  entradaid: string;
  codigo_qr: string;
  estado: string;
  categoria?: string;
  usuario?: {
    name?: string;
    email?: string;
  };
}

/**
 * GET /api/scanner/tickets?eventoid=XXX&estado=USADA|VALIDA
 * Obtiene tickets de un evento filtrados por estado
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const eventoid = searchParams.get('eventoid');
    const estado = searchParams.get('estado') || 'VALIDA'; // Por defecto obtiene sin escanear

    if (!eventoid) {
      return NextResponse.json({ error: 'eventoid es requerido' }, { status: 400 });
    }

    const tickets = await prisma.entradas.findMany({
      where: {
        estado: estado,
        reservas: {
          eventoid: eventoid,
          is_active: true,
          deleted_at: null,
        },
      },
      include: {
        reservas: {
          include: {
            user: true,
            stock_entrada: true,
          },
        },
      },
      orderBy: {
        updated_at: 'desc',
      },
      take: 1000, // Límite de seguridad
    });

    const formattedTickets: Ticket[] = tickets.map((ticket) => ({
      entradaid: ticket.entradaid,
      codigo_qr: ticket.codigo_qr || '',
      estado: ticket.estado,
      categoria: ticket.reservas.stock_entrada?.nombre,
      usuario: {
        name: ticket.reservas.user?.name,
        email: ticket.reservas.user?.email,
      },
    }));

    return NextResponse.json(
      { tickets: formattedTickets, total: formattedTickets.length },
      { status: 200 },
    );
  } catch (error) {
    console.error('[SCANNER] Error obteniendo tickets:', error);
    return NextResponse.json({ error: 'Error al obtener tickets' }, { status: 500 });
  }
}
