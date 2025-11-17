import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/checkout/validate
 * Valida que el usuario y el organizador puedan hacer checkout
 *
 * Body:
 *   - eventId: string (requerido)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { eventId } = body as { eventId?: string };

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // Verificar que el evento existe
    const event = await prisma.eventos.findUnique({
      where: { eventoid: eventId },
      select: {
        creadorid: true,
        titulo: true,
        is_active: true,
        deleted_at: true,
      },
    });

    if (!event || !event.is_active || event.deleted_at) {
      return NextResponse.json({ error: 'Event not found or is not active' }, { status: 404 });
    }

    // Verificar que el organizador tiene wallet vinculada
    const organizer = await prisma.user.findUnique({
      where: { id: event.creadorid },
      select: {
        id: true,
        name: true,
        email: true,
        wallet_linked: true,
        wallet_provider: true,
        mercado_pago_token_expires_at: true,
        mercado_pago_user_id: true,
      },
    });

    if (!organizer) {
      return NextResponse.json({ error: 'Organizer not found' }, { status: 404 });
    }

    if (!organizer.wallet_linked || !organizer.mercado_pago_user_id) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Organizer has not linked their payment wallet',
          code: 'WALLET_NOT_LINKED',
        },
        { status: 402 },
      );
    }

    // Verificar si el token está expirado
    if (organizer.mercado_pago_token_expires_at) {
      const now = new Date();
      const expiresAt = new Date(organizer.mercado_pago_token_expires_at);
      if (now > expiresAt) {
        return NextResponse.json(
          {
            valid: false,
            error: 'Organizer wallet session expired',
            code: 'WALLET_EXPIRED',
          },
          { status: 402 },
        );
      }
    }

    // Verificar que hay stock disponible
    const stockCount = await prisma.stock_entrada.count({
      where: {
        eventoid: eventId,
        cant_max: { gt: 0 },
      },
    });

    if (stockCount === 0) {
      return NextResponse.json(
        {
          valid: false,
          error: 'No ticket categories available for this event',
          code: 'NO_STOCK',
        },
        { status: 409 },
      );
    }

    return NextResponse.json({
      valid: true,
      eventId,
      buyer: {
        id: session.user.id,
        email: session.user.email,
      },
      organizer: {
        id: organizer.id,
        name: organizer.name,
        email: organizer.email,
        wallet_linked: true,
        wallet_provider: organizer.wallet_provider,
        mercado_pago_user_id: organizer.mercado_pago_user_id,
      },
      event: {
        id: eventId,
        title: event.titulo,
      },
    });
  } catch (error) {
    console.error('[Checkout Validate] Error:', error);
    return NextResponse.json(
      {
        valid: false,
        error: 'Error validating checkout',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
