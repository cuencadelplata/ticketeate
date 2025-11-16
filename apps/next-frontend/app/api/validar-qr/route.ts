import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/db';

// Endpoint para validar/escanear un código QR de inscripción a evento gratis
export async function POST(request: NextRequest) {
  try {
    const { eventId, codigo } = await request.json();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!eventId || !codigo) {
      return NextResponse.json({ message: 'eventId y codigo son requeridos' }, { status: 400 });
    }

    // Buscar el código QR
    const codigoQR = await prisma.codigos_qr.findUnique({
      where: { codigo },
      include: {
        inscripciones: {
          include: {
            eventos: true,
          },
        },
      },
    });

    if (!codigoQR) {
      return NextResponse.json({ message: 'Código QR no encontrado' }, { status: 404 });
    }

    // Verificar que pertenece al evento correcto
    if (codigoQR.eventoid !== eventId) {
      return NextResponse.json(
        { message: 'Este código QR no corresponde al evento' },
        { status: 400 },
      );
    }

    // Verificar si ya fue validado
    if (codigoQR.validado) {
      return NextResponse.json(
        {
          message: 'Este código QR ya fue validado',
          data: {
            validado: true,
            fecha_validacion: codigoQR.fecha_validacion,
            inscripcion: codigoQR.inscripciones,
          },
        },
        { status: 200 },
      );
    }

    // Validar el código QR
    const codigoActualizado = await prisma.codigos_qr.update({
      where: { codigoqrid: codigoQR.codigoqrid },
      data: {
        validado: true,
        fecha_validacion: new Date(),
        validado_por: userId || null,
      },
      include: {
        inscripciones: {
          include: {
            eventos: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: 'Código QR validado exitosamente',
        data: {
          validado: true,
          fecha_validacion: codigoActualizado.fecha_validacion,
          inscripcion: codigoActualizado.inscripciones,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error validando código QR:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// Endpoint GET para obtener lista de inscritos a un evento gratis
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ message: 'eventId es requerido' }, { status: 400 });
    }

    // Obtener todas las inscripciones y códigos QR del evento
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
        eventos: {
          select: {
            titulo: true,
          },
        },
      },
      orderBy: { fecha_inscripcion: 'desc' },
    });

    // Estadísticas
    const totalInscritos = inscripciones.length;
    const validados = inscripciones.filter(
      (i: any) => i.codigos_qr.length > 0 && i.codigos_qr[0].validado,
    ).length;
    const pendientes = totalInscritos - validados;

    return NextResponse.json(
      {
        message: 'Inscripciones obtenidas',
        data: {
          evento: inscripciones[0]?.eventos?.titulo || 'Evento',
          estadisticas: {
            totalInscritos,
            validados,
            pendientes,
          },
          inscripciones: inscripciones.map((i: any) => ({
            id: i.inscripcionid,
            nombre: i.nombre,
            correo: i.correo,
            fecha_inscripcion: i.fecha_inscripcion,
            codigoQR: i.codigos_qr[0]?.codigo || null,
            validado: i.codigos_qr.length > 0 && i.codigos_qr[0].validado,
            fecha_validacion: i.codigos_qr[0]?.fecha_validacion || null,
          })),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error obteniendo inscripciones:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
