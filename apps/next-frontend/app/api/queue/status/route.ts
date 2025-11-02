import { NextRequest, NextResponse } from 'next/server';
import { QueueManager } from '@/lib/queue/manager';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

/**
 * GET /api/queue/status?eventId=xxx
 * Obtener estado de la cola para un evento
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const userIdParam = searchParams.get('userId');

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    let userId = userIdParam;

    // Si no se proporciona userId como param, intentar obtenerlo de la sesión
    if (!userId) {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      userId = session?.user?.id;
    }

    // Obtener estado de la cola
    const status = await QueueManager.getQueueStatus(eventId, userId);

    console.log(
      `[API /queue/status] Event: ${eventId}, User: ${userId}, CanEnter: ${status.canEnter}, Queue: ${status.queueLength}, Active: ${status.activeBuyers}`,
    );

    return NextResponse.json({
      success: true,
      status,
    });
  } catch (error) {
    console.error('Error getting queue status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
