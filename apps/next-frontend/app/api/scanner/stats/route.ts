import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/db';

interface TicketStats {
  total: number;
  scanned: number;
  pending: number;
  percentage: number;
}

/**
 * GET /api/scanner/stats?eventoid=XXX
 * Obtiene estadísticas de tickets para un evento
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const eventoid = searchParams.get('eventoid');

    if (!eventoid) {
      return NextResponse.json({ error: 'eventoid es requerido' }, { status: 400 });
    }

    // Contar tickets totales del evento
    const totalTickets = await prisma.entradas.count({
      where: {
        reservas: {
          eventoid: eventoid,
          is_active: true,
          deleted_at: null,
        },
      },
    });

    // Contar tickets escaneados (USADA)
    const scannedTickets = await prisma.entradas.count({
      where: {
        estado: 'USADA',
        reservas: {
          eventoid: eventoid,
          is_active: true,
          deleted_at: null,
        },
      },
    });

    const pendingTickets = totalTickets - scannedTickets;
    const percentage = totalTickets > 0 ? Math.round((scannedTickets / totalTickets) * 100) : 0;

    const stats: TicketStats = {
      total: totalTickets,
      scanned: scannedTickets,
      pending: pendingTickets,
      percentage,
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error('[SCANNER] Error obteniendo estadísticas:', error);
    return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 });
  }
}
