import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: (req as any).headers });
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { role, inviteCode } = await req.json();
  let targetRole = 'USUARIO';

  if (role === 'ADMIN' && inviteCode && inviteCode === process.env.INVITE_CODE_ADMIN) {
    targetRole = 'ADMIN';
  } else if (role === 'ORGANIZADOR' && inviteCode && inviteCode === process.env.INVITE_CODE_ORG) {
    targetRole = 'ORGANIZADOR';
  } else if (role === 'USUARIO') {
    targetRole = 'USUARIO';
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { role: targetRole as any },
  });

  return NextResponse.json({ ok: true, role: targetRole });
}
