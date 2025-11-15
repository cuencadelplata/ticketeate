import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/db';

export async function POST(req: Request) {
  try {
    const { role, inviteCode } = (await req.json()) as {
      role: 'USUARIO' | 'ORGANIZADOR';
      inviteCode?: string;
    };

    if (!role || !['USUARIO', 'ORGANIZADOR'].includes(role)) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    if (role === 'USUARIO') {
    } else if (role === 'ORGANIZADOR') {
      // ORGANIZADOR requiere código de invitación
      if (!inviteCode)
        return NextResponse.json(
          { error: 'Código de organizador requerido' },
          { status: 400 },
        );
      const ok = inviteCode === process.env.INVITE_CODE_ORG;
      if (!ok)
        return NextResponse.json({ error: 'Código de organizador inválido' }, { status: 401 });
    }

    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        role: role as any,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
