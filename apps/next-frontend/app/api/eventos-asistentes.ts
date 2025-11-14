import { NextRequest, NextResponse } from 'next/server';
import { db } from '@repo/db';
import { getSession } from '@/lib/auth-client';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Verificar permisos
    if (session.user.role !== 'ORGANIZADOR' && session.user.role !== 'COLABORADOR') {
      return NextResponse.json(
        { error: 'Acceso denegado' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { error: 'ID de evento no proporcionado' },
        { status: 400 }
      );
    }

    // Verificar que sea organizador o colaborador del evento
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
      // TODO: Verificar si es colaborador invitado
      return NextResponse.json(
        { error: 'No tienes permisos para este evento' },
        { status: 403 }
      );
    }

    const asistentes = await db.reservas.findMany({
      where: {
        eventoid: eventId,
        estado: { not: 'CANCELADO' },
      },
      include: {
        entradas: {
          select: {
            entradaid: true,
            codigo_qr: true,
            estado: true,
          },
        },
        usuario: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const formattedAsistentes = asistentes.flatMap((reserva) =>
      reserva.entradas.map((entrada) => ({
        id: `${reserva.usuarioid}-${entrada.entradaid}`,
        usuarioid: reserva.usuarioid,
        nombre: reserva.usuario?.name || 'Desconocido',
        email: reserva.usuario?.email || 'N/A',
        entrada_id: entrada.entradaid,
        codigo_qr: entrada.codigo_qr,
        estado: entrada.estado === 'VALIDA' ? 'PENDIENTE' : 'ESCANEADO',
        fecha_escaneo: entrada.estado === 'VALIDA' ? null : new Date().toISOString(),
      }))
    );

    const stats = {
      total: formattedAsistentes.length,
      escaneados: formattedAsistentes.filter((a) => a.estado === 'ESCANEADO').length,
      pendientes: formattedAsistentes.filter((a) => a.estado === 'PENDIENTE').length,
    };

    return NextResponse.json({ asistentes: formattedAsistentes, stats });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al cargar asistentes' },
      { status: 500 }
    );
  }
}
