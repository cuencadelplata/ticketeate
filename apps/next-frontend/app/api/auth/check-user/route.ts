import { NextResponse } from 'next/server';
import { prisma } from '@repo/db';

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email: string };

    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    return NextResponse.json({ exists: !!user });
  } catch (error) {
    console.error('Error checking user:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
