import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/db';

/**
 * GET /api/eventos?id=XXX
 * Obtiene información de un evento específico
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('id');

    if (!eventId) {
      return NextResponse.json({ error: 'id es requerido' }, { status: 400 });
    }

    // Obtener información del evento
    const evento = await prisma.eventos.findUnique({
      where: { eventoid: eventId },
      include: {
        stock_entrada: true,
        fechas_evento: true,
      },
    });

    if (!evento) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ event: evento }, { status: 200 });
  } catch (error) {
    console.error('[EVENTOS] Error obteniendo evento:', error);
    return NextResponse.json({ error: 'Error al obtener evento' }, { status: 500 });
  }
}
