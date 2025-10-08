import { NextRequest, NextResponse } from 'next/server';
import { redisClient } from '@/lib/redis-client';
import { prisma } from '@repo/db';

// Endpoint para finalizar compra y liberar espacio
export async function POST(request: NextRequest) {
  try {
    const { eventId, userId, success = true } = await request.json();

    if (!eventId || !userId) {
      return NextResponse.json({ error: 'eventId y userId son requeridos' }, { status: 400 });
    }

    const completed = await redisClient.completePurchase(eventId, userId);

    if (completed) {
      // Actualizar estado en BD
      await prisma.cola_turnos.updateMany({
        where: {
          usuarioid: userId,
          colas_evento: {
            eventoid: eventId,
          },
        },
        data: {
          estado: success ? 'completado' : 'abandonado',
        },
      });
    }

    return NextResponse.json({ success: completed });
  } catch (error) {
    console.error('Error completing purchase:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
