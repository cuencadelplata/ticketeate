import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/db';

/**
 * GET /api/user/inscripciones
 * Obtiene todas las inscripciones del usuario autenticado
 */
export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = session.user.id;

    // Obtener todas las inscripciones del usuario con información del evento y códigos QR
    const inscripciones = await prisma.inscripciones_evento.findMany({
      where: {
        usuarioid: userId,
      },
      include: {
        eventos: {
          select: {
            eventoid: true,
            titulo: true,
            descripcion: true,
            ubicacion: true,
            fechas_evento: {
              select: {
                fecha_hora: true,
                fecha_fin: true,
              },
              orderBy: {
                fecha_hora: 'asc',
              },
              take: 1,
            },
            imagenes_evento: {
              where: {
                tipo: 'PORTADA',
              },
              select: {
                url: true,
              },
              take: 1,
            },
            evento_estado: {
              select: {
                Estado: true,
              },
              orderBy: {
                fecha_de_cambio: 'desc',
              },
              take: 1,
            },
          },
        },
        codigos_qr: {
          select: {
            codigoqrid: true,
            codigo: true,
            datos_qr: true,
            validado: true,
            fecha_creacion: true,
            fecha_validacion: true,
          },
          orderBy: {
            fecha_creacion: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        fecha_inscripcion: 'desc',
      },
    });

    // Mapear la respuesta al formato esperado por el frontend
    const inscripcionesFormateadas = inscripciones.map((inscripcion) => {
      const evento = inscripcion.eventos;
      const primeraFecha = evento.fechas_evento?.[0];
      const qr = inscripcion.codigos_qr?.[0];
      const estadoEvento = evento.evento_estado?.[0]?.Estado || 'OCULTO';

      // Determinar el estado de la inscripción
      let statusInscripcion: 'validated' | 'pending' | 'cancelled' = 'pending';
      if (qr?.validado) {
        statusInscripcion = 'validated';
      } else if (inscripcion.estado === 'cancelado') {
        statusInscripcion = 'cancelled';
      }

      return {
        inscripcionid: inscripcion.inscripcionid,
        eventid: evento.eventoid,
        eventTitle: evento.titulo,
        eventDescription: evento.descripcion,
        eventDate: primeraFecha?.fecha_hora
          ? new Date(primeraFecha.fecha_hora).toISOString()
          : null,
        eventLocation: evento.ubicacion,
        eventImage: evento.imagenes_evento?.[0]?.url || null,
        eventStatus: estadoEvento,
        nombre: inscripcion.nombre,
        correo: inscripcion.correo,
        qrCode: qr?.codigo || null,
        qrData: qr?.datos_qr || null,
        qrValidated: qr?.validado || false,
        qrValidationDate: qr?.fecha_validacion ? new Date(qr.fecha_validacion).toISOString() : null,
        inscriptionDate: new Date(inscripcion.fecha_inscripcion).toISOString(),
        status: statusInscripcion,
        inscriptionStatus: inscripcion.estado,
      };
    });

    return NextResponse.json(
      {
        inscripciones: inscripcionesFormateadas,
        total: inscripcionesFormateadas.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[INSCRIPCIONES] Error obteniendo inscripciones:', error);
    return NextResponse.json({ error: 'Error al obtener las inscripciones' }, { status: 500 });
  }
}
