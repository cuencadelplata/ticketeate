import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/db';
import { headers } from 'next/headers';

// POST /api/tickets/validate-qr
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, eventId } = body;

    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return NextResponse.json(
        { success: false, code: 'INVALID_QR', message: 'El código QR no es válido o ha expirado' },
        { status: 400 },
      );
    }

    const ticket = await prisma.entradas.findUnique({
      where: { codigo_qr: code.trim() },
      include: {
        reservas: {
          include: {
            eventos: { select: { eventoid: true, titulo: true } },
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    if (!ticket || ticket.estado === 'CANCELADA') {
      return NextResponse.json(
        {
          success: false,
          code: 'TICKET_NOT_FOUND',
          message: 'La entrada no existe o ha sido cancelada',
        },
        { status: 404 },
      );
    }

    const reservation = ticket.reservas;
    if (eventId && reservation.eventos.eventoid !== eventId) {
      return NextResponse.json(
        {
          success: false,
          code: 'EVENT_MISMATCH',
          message: 'El código QR no corresponde a este evento',
        },
        { status: 400 },
      );
    }

    if (ticket.estado === 'USADA') {
      return NextResponse.json(
        { success: false, code: 'DUPLICATE_ENTRY', message: 'Esta entrada ya ha sido validada' },
        { status: 409 },
      );
    }

    const validationTime = new Date();
    const headersList = await headers();
    const userId = headersList.get('x-user-id') || 'SISTEMA';

    await prisma.$transaction([
      prisma.entradas.update({
        where: { entradaid: ticket.entradaid },
        data: { estado: 'USADA', updated_by: userId },
      }),
      prisma.logs_eventos.create({
        data: {
          logid: `log-${ticket.entradaid}-${Date.now()}`,
          eventoid: reservation.eventos.eventoid,
          usuarioid: userId,
          accion: 'TICKET_SCANNED',
          detalle: `Ticket escaneado: ${ticket.codigo_qr}`,
          fecha: validationTime,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      ticketId: ticket.entradaid,
      eventName: reservation.eventos.titulo,
      eventId: reservation.eventos.eventoid,
      attendeeName: reservation.user?.name || 'N/A',
      attendeeEmail: reservation.user?.email || 'N/A',
      seatNumber: 'A-12',
      section: 'General',
      ticketType: 'General',
      validationTime: validationTime.toISOString(),
      message: 'Entrada validada correctamente',
    });
  } catch (error) {
    console.error('Error validating QR:', error);
    return NextResponse.json(
      { success: false, code: 'VALIDATION_ERROR', message: 'Error al validar el código QR' },
      { status: 500 },
    );
  }
}
