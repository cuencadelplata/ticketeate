import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        wallet_linked: true,
        wallet_provider: true,
      },
    });

    if (!user?.wallet_linked || user.wallet_provider !== 'mock') {
      return NextResponse.json({ error: 'Billetera mock no vinculada' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const amount = typeof body.amount === 'number' ? body.amount : 0;
    const eventId = typeof body.eventId === 'string' ? body.eventId : null;
    const ticketCount = typeof body.ticketCount === 'number' ? body.ticketCount : 0;

    if (!eventId || amount <= 0 || ticketCount <= 0) {
      return NextResponse.json({ error: 'Datos de pago simulados inválidos' }, { status: 400 });
    }

    const paymentId = `mock_payment_${Date.now()}`;

    return NextResponse.json({
      success: true,
      paymentId,
      status: 'completed',
      amount,
      eventId,
      ticketCount,
      message: 'Pago simulado exitosamente',
    });
  } catch (error) {
    console.error('[Wallet][POST simulate-payment] Unexpected error:', error);
    return NextResponse.json({ error: 'Error al procesar el pago simulado' }, { status: 500 });
  }
}
