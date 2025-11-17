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

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        wallet_linked: false,
        wallet_provider: null,
        mercado_pago_user_id: null,
        mercado_pago_access_token: null,
        mercado_pago_refresh_token: null,
        mercado_pago_token_expires_at: null,
      },
      select: {
        wallet_linked: true,
        wallet_provider: true,
      },
    });

    return NextResponse.json({
      wallet_linked: user.wallet_linked ?? false,
      wallet_provider: user.wallet_provider ?? null,
    });
  } catch (error) {
    console.error('[Wallet][POST unlink] Unexpected error:', error);
    return NextResponse.json({ error: 'Error al desvincular billetera' }, { status: 500 });
  }
}
