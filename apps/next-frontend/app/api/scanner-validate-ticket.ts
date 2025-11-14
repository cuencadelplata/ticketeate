import { NextRequest, NextResponse } from 'next/server';
import { db } from '@repo/db';
import { getSession } from '@/lib/auth-client';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user || (session.user.role !== 'ORGANIZADOR' && session.user.role !== 'COLABORADOR')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { eventId, qr_code } = await request.json();

    if (!eventId || !qr_code) {
      return NextResponse.json(
        { error: 'Parámetros faltantes' },
        { status: 400 }
      );
    }

    const evento = await db.eventos.findUnique({
      where: { eventoid: eventId },
    });

    if (!evento) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    if (evento.creadorid !== session.user.id && session.user.role === 'USUARIO') {
      return NextResponse.json(
        { error: 'No tienes permiso para este evento' },
        { status: 403 }
      );
    }

    const entrada = await db.entradas.findFirst({
      where: {
        codigo_qr: qr_code,
        reserva: {
          eventoid: eventId,
        },
      },
      include: {
        reserva: {
          include: {
            usuario: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!entrada) {
      return NextResponse.json(
        { error: 'Entrada no encontrada' },
        { status: 404 }
      );
    }

    if (entrada.estado === 'ESCANEADA') {
      return NextResponse.json(
        { error: 'Entrada ya fue escaneada' },
        { status: 400 }
      );
    }

    const entradaActualizada = await db.entradas.update({
      where: { entradaid: entrada.entradaid },
      data: {
        estado: 'ESCANEADA',
        updated_by: session.user.id,
      },
      include: {
        reserva: {
          include: {
            usuario: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      attendee_id: entrada.reserva.usuarioid,
      attendee_name: entrada.reserva.usuario?.name || 'Desconocido',
      ticket: {
        id: entrada.entradaid,
        codigo_qr: entrada.codigo_qr,
        estado: entradaActualizada.estado,
        entry_index: 0,
      },
    });
  } catch (error) {
    console.error('Error validating ticket:', error);
    return NextResponse.json(
      { error: 'Error validando entrada' },
      { status: 500 }
    );
  }
}
