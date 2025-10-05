import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/db';

export async function POST(req: Request) {
  try {
    const { role, inviteCode } = (await req.json()) as {
      role: 'ADMIN' | 'ORGANIZADOR';
      inviteCode: string;
    };

    if (!role || !inviteCode || !['ADMIN', 'ORGANIZADOR'].includes(role)) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const ok =
      (role === 'ADMIN' && inviteCode === process.env.INVITE_CODE_ADMIN) ||
      (role === 'ORGANIZADOR' && inviteCode === process.env.INVITE_CODE_ORG);

    if (!ok) {
      return NextResponse.json({ error: 'Código de invitación inválido' }, { status: 401 });
    }

    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { role },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
