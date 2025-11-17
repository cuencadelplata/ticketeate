import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/db';

// Endpoint de debug para verificar inscripciones en la BD
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const correo = searchParams.get('correo');

    if (!eventId && !correo) {
      return NextResponse.json({ message: 'eventId o correo es requerido' }, { status: 400 });
    }

    let inscripciones;
    let totalCount;

    if (eventId) {
      // Buscar por evento
      inscripciones = await prisma.inscripciones_evento.findMany({
        where: { eventoid: eventId },
        include: {
          codigos_qr: true,
          eventos: {
            select: {
              titulo: true,
              eventoid: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      totalCount = inscripciones.length;
    } else if (correo) {
      // Buscar por correo
      inscripciones = await prisma.inscripciones_evento.findMany({
        where: { correo: correo.toLowerCase() },
        include: {
          codigos_qr: true,
          eventos: {
            select: {
              titulo: true,
              eventoid: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      totalCount = inscripciones.length;
    }

    return NextResponse.json(
      {
        debug: true,
        query: {
          eventId,
          correo,
        },
        totalCount,
        inscripciones:
          inscripciones?.map((i: any) => ({
            inscripcionid: i.inscripcionid,
            eventoid: i.eventoid,
            nombre: i.nombre,
            correo: i.correo,
            usuarioid: i.usuarioid,
            fecha_inscripcion: i.fecha_inscripcion,
            estado: i.estado,
            evento_titulo: i.eventos?.titulo,
            evento_id_en_bd: i.eventos?.eventoid,
            codigos_qr_count: i.codigos_qr?.length || 0,
            codigos_qr: i.codigos_qr?.map((c: any) => ({
              codigo: c.codigo,
              validado: c.validado,
            })),
            user: i.user,
          })) || [],
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error en debug:', error);
    return NextResponse.json(
      {
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
