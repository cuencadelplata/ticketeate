import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      wallet_linked: user.wallet_linked ?? false,
      wallet_provider: user.wallet_provider ?? null,
    });
  } catch (error) {
    console.error('[Wallet][GET] Unexpected error:', error);
    return NextResponse.json({ error: 'Error al obtener estado de billetera' }, { status: 500 });
  }
}
