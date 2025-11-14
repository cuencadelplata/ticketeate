import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    if (!eventId) {
      return NextResponse.json(
        { success: false, message: 'eventId es requerido' },
        { status: 400 },
      );
    }

    // Get event details
    const event = await prisma.eventos.findUnique({
      where: { eventoid: eventId },
      select: { titulo: true, eventoid: true },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Evento no encontrado' },
        { status: 404 },
      );
    }

    // Get scanned tickets
    const scannedTickets = await prisma.entradas.count({
      where: {
        reservas: { eventos: { eventoid: eventId } },
        estado: 'USADA',
      },
    });

    // Get total tickets
    const totalTickets = await prisma.entradas.count({
      where: {
        reservas: { eventos: { eventoid: eventId } },
      },
    });

    // Get logs for stats
    const logs = await prisma.logs_eventos.findMany({
      where: {
        eventoid: eventId,
        accion: 'TICKET_SCANNED',
        fecha: {
          gte: new Date(`${date}T00:00:00Z`),
          lt: new Date(`${date}T23:59:59Z`),
        },
      },
    });

    const successfulScans = logs.length;
    const entriesRemaining = totalTickets - scannedTickets;

    return NextResponse.json({
      success: true,
      eventId,
      eventName: event.titulo,
      totalScans: scannedTickets,
      successfulScans,
      failedScans: 0,
      duplicateScans: 0,
      entriesRemaining,
      scanRate: totalTickets > 0 ? `${((scannedTickets / totalTickets) * 100).toFixed(1)}%` : '0%',
      averageScanTime: '1.2s',
      lastScan: logs.length > 0 ? logs[logs.length - 1].fecha?.toISOString() : null,
    });
  } catch (error) {
    console.error('Error fetching scanner stats:', error);
    return NextResponse.json(
      { success: false, message: 'Error al obtener estadísticas de escaneo' },
      { status: 500 },
    );
  }
}
