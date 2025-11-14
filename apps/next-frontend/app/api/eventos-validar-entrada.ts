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

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const { codigo_qr, qr_data } = await request.json();
    const qrCode = codigo_qr || qr_data;

    if (!eventId || !qrCode) {
      return NextResponse.json(
        { error: 'Parámetros faltantes' },
        { status: 400 }
      );
    }

    // Verificar acceso al evento
    const evento = await db.eventos.findUnique({
      where: { eventoid: eventId },
    });

    if (!evento) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    if (evento.creadorid !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para este evento' },
        { status: 403 }
      );
    }

    const entrada = await db.entradas.findFirst({
      where: {
        codigo_qr: qrCode,
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
        { success: false, message: 'Entrada no encontrada' },
        { status: 404 }
      );
    }

    if (entrada.estado !== 'VALIDA') {
      return NextResponse.json(
        { success: false, message: 'Esta entrada ya fue escaneada' },
        { status: 400 }
      );
    }

    // Marcar entrada como escaneada
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
      message: `Entrada de ${entrada.reserva.usuario?.name} validada`,
      data: {
        id: entrada.entradaid,
        usuarioid: entrada.reserva.usuarioid,
        nombre: entrada.reserva.usuario?.name || 'Desconocido',
        email: entrada.reserva.usuario?.email || 'N/A',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, message: 'Error al validar entrada' },
      { status: 500 }
    );
  }
}
