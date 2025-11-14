import { NextRequest, NextResponse } from 'next/server';
import { db } from '@repo/db';
import { getSession } from '@/lib/auth-client';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const pathSegments = request.nextUrl.pathname.split('/');
    const eventId = pathSegments[3];

    if (!eventId) {
      return NextResponse.json(
        { error: 'ID de evento no proporcionado' },
        { status: 400 }
      );
    }

    const evento = await db.eventos.findFirst({
      where: { eventoid: eventId },
      select: {
        eventoid: true,
        titulo: true,
        descripcion: true,
        ubicacion: true,
        creadorid: true,
      },
    });

    if (!evento) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    const tienePermiso = evento.creadorid === session.user.id;

    if (!tienePermiso) {
      return NextResponse.json(
        { error: 'No tienes permiso para acceder a este evento' },
        { status: 403 }
      );
    }

    return NextResponse.json(evento);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener información del evento' },
      { status: 500 }
    );
  }
}
