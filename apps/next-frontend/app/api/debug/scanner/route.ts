import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/db';

// Endpoint para debuggear exactamente lo que devuelve el scanner
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ message: 'eventId es requerido' }, { status: 400 });
    }

    console.log('=== DEBUG SCANNER ===');
    console.log('EventId recibido:', eventId);

    // Query exacta del scanner
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
          take: 1,
        },
        eventos: {
          select: {
            titulo: true,
          },
        },
      },
      orderBy: { fecha_inscripcion: 'desc' },
    });

    console.log('Inscripciones raw:', inscripciones);
    console.log('Cantidad:', inscripciones.length);

    // Mapeo exacto del scanner
    const mapped = inscripciones.map((i: any) => ({
      id: i.inscripcionid,
      nombre: i.nombre,
      correo: i.correo,
      fecha_inscripcion: i.fecha_inscripcion,
      codigoQR: i.codigos_qr && i.codigos_qr.length > 0 ? i.codigos_qr[0].codigo : null,
      validado: i.codigos_qr && i.codigos_qr.length > 0 && i.codigos_qr[0].validado,
      fecha_validacion:
        i.codigos_qr && i.codigos_qr.length > 0 ? i.codigos_qr[0].fecha_validacion : null,
    }));

    console.log('Mapped:', mapped);

    // Estadísticas
    const totalInscritos = inscripciones.length;
    const validados = inscripciones.filter(
      (i: any) => i.codigos_qr && i.codigos_qr.length > 0 && i.codigos_qr[0].validado,
    ).length;
    const pendientes = totalInscritos - validados;

    console.log('Estadísticas:', { totalInscritos, validados, pendientes });

    return NextResponse.json(
      {
        debug: 'Scanner Debug',
        eventId,
        inscripciones_raw: inscripciones,
        inscripciones_mapped: mapped,
        estadisticas: {
          totalInscritos,
          validados,
          pendientes,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error debug scanner:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
