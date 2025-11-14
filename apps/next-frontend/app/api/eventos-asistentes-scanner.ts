import { NextRequest, NextResponse } from 'next/server';
import { db } from '@repo/db';
import { getSession } from '@/lib/auth-client';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user || (session.user.role !== 'ORGANIZADOR' && session.user.role !== 'COLABORADOR')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID requerido' },
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

    const reservas = await db.reservas.findMany({
      where: { eventoid: eventId },
      include: {
        usuario: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        entradas: {
          select: {
            entradaid: true,
            codigo_qr: true,
            estado: true,
          },
        },
      },
    });

    const asistentes = reservas.map((reserva) => {
      const entradasEscaneadas = reserva.entradas.filter((e) => e.estado === 'ESCANEADA').length;
      const entradasPendientes = reserva.entradas.length - entradasEscaneadas;

      return {
        id: reserva.usuarioid,
        usuarioid: reserva.usuarioid,
        nombre: reserva.usuario?.name || 'Desconocido',
        email: reserva.usuario?.email || 'N/A',
        entrada_id: reserva.entradas[0]?.entradaid || '',
        codigo_qr: reserva.entradas[0]?.codigo_qr || '',
        estado: entradasEscaneadas > 0 ? 'ESCANEADO' : 'Pendiente',
        fecha_escaneo:
          reserva.entradas.find((e) => e.estado === 'ESCANEADA')?.estado === 'ESCANEADA' ? new Date() : null,
        tickets: reserva.cantidad,
        scanned: entradasEscaneadas,
        remaining: entradasPendientes,
      };
    });

    const stats = {
      total: reservas.reduce((sum, r) => sum + r.entradas.length, 0),
      escaneados: reservas.reduce(
        (sum, r) => sum + r.entradas.filter((e) => e.estado === 'ESCANEADA').length,
        0
      ),
      pendientes: reservas.reduce(
        (sum, r) => sum + r.entradas.filter((e) => e.estado !== 'ESCANEADA').length,
        0
      ),
    };

    return NextResponse.json({
      asistentes,
      stats,
    });
  } catch (error) {
    console.error('Error fetching attendees:', error);
    return NextResponse.json(
      { error: 'Error al obtener asistentes' },
      { status: 500 }
    );
  }
}
