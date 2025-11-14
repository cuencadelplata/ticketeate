import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/db';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const userRole = session.user?.role as string;
    if (userRole !== 'COLABORADOR' && userRole !== 'ORGANIZADOR') {
      return NextResponse.json(
        { error: 'Solo colaboradores y organizadores pueden escanear entradas' },
        { status: 403 },
      );
    }

    const { code, eventId } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Código QR requerido' }, { status: 400 });
    }

    const entrada = await prisma.entradas.findUnique({
      where: { codigo_qr: code },
      include: {
        reserva: {
          include: {
            evento: true,
            usuario: true,
          },
        },
      },
    });

    if (!entrada) {
      return NextResponse.json({ error: 'TICKET_NOT_FOUND' }, { status: 404 });
    }

    if (entrada.estado === 'USADA') {
      return NextResponse.json({ error: 'DUPLICATE_SCAN' }, { status: 409 });
    }

    if (entrada.estado !== 'VALIDA') {
      return NextResponse.json({ error: 'INVALID_TICKET' }, { status: 400 });
    }

    if (eventId && entrada.reserva?.eventoid !== eventId) {
      return NextResponse.json({ error: 'Evento no coincide' }, { status: 400 });
    }

    await prisma.entradas.update({
      where: { entradaid: entrada.entradaid },
      data: { estado: 'USADA' },
    });

    return NextResponse.json({
      success: true,
      ticket: {
        id: entrada.entradaid,
        code,
        status: 'VALIDA',
        event: entrada.reserva?.evento?.titulo,
        user: entrada.reserva?.usuario?.name,
      },
    });
  } catch (error) {
    console.error('Scanner validation error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
