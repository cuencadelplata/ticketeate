import { NextRequest, NextResponse } from 'next/server';
import { QueueManager } from '@/lib/queue/manager';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

/**
 * POST /api/queue/join
 * Unirse a la cola de compra de un evento
 */
export async function POST(request: NextRequest) {
  try {
    // Validar autenticación
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
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

    // Unirse a la cola
    const position = await QueueManager.joinQueue(eventId, session.user.id);

    if (!position) {
      return NextResponse.json(
        { error: 'Failed to join queue' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      position,
      message: position.position === 0 
        ? 'You can now proceed to checkout'
        : `You are in position ${position.position} in the queue`,
    });
  } catch (error) {
    console.error('Error in queue join:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
