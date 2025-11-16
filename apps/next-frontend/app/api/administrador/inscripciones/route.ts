import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// Endpoint para obtener inscripciones de un evento (solo el organizador)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ message: 'eventId es requerido' }, { status: 400 });
    }

    // Obtener la sesión del usuario
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
    }

    // Verificar que el usuario es el organizador del evento
    const evento = await prisma.eventos.findUnique({
      where: { eventoid: eventId },
      select: { creadorid: true, titulo: true },
    });

    if (!evento) {
      return NextResponse.json({ message: 'Evento no encontrado' }, { status: 404 });
    }

    if (evento.creadorid !== session.user.id) {
      return NextResponse.json(
        { message: 'No tienes permiso para ver las inscripciones' },
        { status: 403 },
      );
    }

    // Obtener todas las inscripciones del evento
    const inscripciones = await prisma.inscripciones_evento.findMany({
      where: { eventoid: eventId },
      include: {
        codigos_qr: {
          select: {
            codigoqrid: true,
            codigo: true,
            validado: true,
            fecha_validacion: true,
          },
        },
      },
      orderBy: { fecha_inscripcion: 'desc' },
    });

    // Calcular estadísticas
    const totalInscritos = inscripciones.length;
    const validados = inscripciones.filter(
      (i: any) => i.codigos_qr.length > 0 && i.codigos_qr[0].validado,
    ).length;
    const pendientes = totalInscritos - validados;

    // Formatear respuesta
    const inscripcionesFormateadas = inscripciones.map((i: any) => ({
      id: i.inscripcionid,
      nombre: i.nombre,
      correo: i.correo,
      fecha_inscripcion: i.fecha_inscripcion,
      codigoQR: i.codigos_qr[0]?.codigo || null,
      validado: i.codigos_qr.length > 0 && i.codigos_qr[0].validado,
      fecha_validacion: i.codigos_qr[0]?.fecha_validacion || null,
    }));

    return NextResponse.json(
      {
        message: 'Inscripciones obtenidas',
        data: {
          evento: {
            titulo: evento.titulo,
          },
          estadisticas: {
            totalInscritos,
            validados,
            pendientes,
          },
          inscripciones: inscripcionesFormateadas,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error obteniendo inscripciones:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
