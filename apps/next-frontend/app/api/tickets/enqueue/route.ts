import { NextRequest, NextResponse } from 'next/server';
import { enqueueTicketJob } from '@/lib/services/ticket-queue';
import type { TicketData } from '@/lib/services/ticket-generator';

export interface EnqueueTicketRequest {
  reservaId: string;
  userId: string;
  userEmail: string;
  userName?: string;
  eventId: string;
  ticketData: TicketData;
  priority?: number;
}

/**
 * POST /api/tickets/enqueue
 * Encolar generación y envío de comprobante
 */
export async function POST(request: NextRequest) {
  try {
    const body: EnqueueTicketRequest = await request.json();
    const {
      reservaId,
      userId,
      userEmail,
      userName,
      eventId,
      ticketData,
      priority,
    } = body;

    if (!reservaId || !userId || !userEmail || !eventId || !ticketData) {
      return NextResponse.json(
        {
          error: 'Missing required fields: reservaId, userId, userEmail, eventId, ticketData',
        },
        { status: 400 }
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Encolar el trabajo
    const jobId = await enqueueTicketJob(
      reservaId,
      userId,
      userEmail,
      eventId,
      ticketData,
      {
        userName,
        priority,
        maxAttempts: 3,
      }
    );

    return NextResponse.json({
      success: true,
      jobId,
      message: 'Ticket generation job enqueued successfully',
    });
  } catch (error: any) {
    console.error('[EnqueueTicket] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
