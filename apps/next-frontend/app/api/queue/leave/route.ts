import { NextRequest, NextResponse } from 'next/server';
import { QueueManager } from '@/lib/queue/manager';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

/**
 * POST /api/queue/leave
 * Salir de la cola (cancelar o completar compra)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    await QueueManager.leaveQueue(eventId, session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Successfully left the queue',
    });
  } catch (error) {
    console.error('Error leaving queue:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
