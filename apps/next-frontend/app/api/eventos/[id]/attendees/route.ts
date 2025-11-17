import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/db';

/**
 * GET /api/eventos/[id]/attendees
 * Obtiene la lista de asistentes (inscriptos con rol USUARIO) de un evento
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const eventId = id;

    // Obtener inscriptos del evento con rol USUARIO
    const inscripciones = await prisma.inscripciones_evento.findMany({
      where: {
        eventoid: eventId,
        user: {
          role: 'USUARIO', // Solo usuarios, no organizadores
        },
      },
      select: {
        usuarioid: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        fecha_inscripcion: 'desc',
      },
    });

    // Transformar datos a formato esperado
    const attendees = inscripciones
      .filter((inscripcion) => inscripcion.user !== null)
      .map((inscripcion) => ({
        usuarioid: inscripcion.user!.id,
        name: inscripcion.user!.name,
        email: inscripcion.user!.email,
        image: inscripcion.user!.image || undefined,
      }));

    return NextResponse.json(
      {
        attendees,
        total: attendees.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[EVENTO ATTENDEES]:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener asistentes',
        attendees: [],
        total: 0,
      },
      { status: 500 },
    );
  }
}
