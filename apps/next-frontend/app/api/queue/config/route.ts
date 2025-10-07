import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/db';
import { randomUUID } from 'node:crypto';

// Endpoint para configurar cola desde la UI de administración
export async function POST(request: NextRequest) {
  try {
    const { eventId, maxConcurrent = 10, maxUsers = 1000 } = await request.json();

    if (!eventId) {
      return NextResponse.json({ error: 'eventId es requerido' }, { status: 400 });
    }

    // Verificar que el evento existe
    const event = await prisma.eventos.findUnique({
      where: { eventoid: eventId },
      select: { titulo: true, estado: true },
    });

    if (!event) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    // Verificar si ya existe configuración
    const existingQueue = await prisma.colas_evento.findFirst({
      where: { eventoid: eventId },
    });

    if (existingQueue) {
      // Actualizar configuración existente
      const updatedQueue = await prisma.colas_evento.update({
        where: { colaid: existingQueue.colaid },
        data: {
          max_concurrentes: maxConcurrent,
          max_usuarios: maxUsers,
        },
      });

      return NextResponse.json({
        success: true,
        action: 'updated',
        queueConfig: {
          colaid: updatedQueue.colaid,
          eventoid: updatedQueue.eventoid,
          maxConcurrent: updatedQueue.max_concurrentes,
          maxUsers: updatedQueue.max_usuarios,
        },
      });
    } else {
      // Crear nueva configuración
      const newQueue = await prisma.colas_evento.create({
        data: {
          colaid: randomUUID(),
          eventoid: eventId,
          max_concurrentes: maxConcurrent,
          max_usuarios: maxUsers,
        },
      });

      return NextResponse.json({
        success: true,
        action: 'created',
        queueConfig: {
          colaid: newQueue.colaid,
          eventoid: newQueue.eventoid,
          maxConcurrent: newQueue.max_concurrentes,
          maxUsers: newQueue.max_usuarios,
        },
      });
    }
  } catch (error) {
    console.error('Error configuring queue:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// Endpoint para obtener configuración de cola
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ error: 'eventId es requerido' }, { status: 400 });
    }

    const queueConfig = await prisma.colas_evento.findFirst({
      where: { eventoid: eventId },
      include: {
        eventos: {
          select: { titulo: true, estado: true },
        },
        _count: {
          select: { cola_turnos: true },
        },
      },
    });

    if (!queueConfig) {
      return NextResponse.json(
        { error: 'No hay configuración de cola para este evento' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      queueConfig: {
        colaid: queueConfig.colaid,
        eventoid: queueConfig.eventoid,
        maxConcurrent: queueConfig.max_concurrentes,
        maxUsers: queueConfig.max_usuarios,
        createdAt: queueConfig.fecha_creacion,
        event: queueConfig.eventos,
        totalTurns: queueConfig._count.cola_turnos,
      },
    });
  } catch (error) {
    console.error('Error getting queue config:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// Endpoint para eliminar configuración de cola
export async function DELETE(request: NextRequest) {
  try {
    const { eventId } = await request.json();

    if (!eventId) {
      return NextResponse.json({ error: 'eventId es requerido' }, { status: 400 });
    }

    const result = await prisma.colas_evento.deleteMany({
      where: { eventoid: eventId },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'No se encontró configuración de cola para este evento' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      deleted: result.count,
    });
  } catch (error) {
    console.error('Error deleting queue config:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
