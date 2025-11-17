import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { codigo } = await request.json();

    if (!codigo || typeof codigo !== 'string') {
      return NextResponse.json({ error: 'Código de invitación requerido' }, { status: 400 });
    }

    // Buscar el código en la base de datos
    const inviteCode = await prisma.invite_codes.findFirst({
      where: {
        codigo: codigo.trim().toUpperCase(),
        estado: 'ACTIVO',
        fecha_expiracion: {
          gt: new Date(),
        },
      },
    });

    if (!inviteCode) {
      return NextResponse.json(
        { error: 'Código de invitación no válido o expirado' },
        { status: 404 },
      );
    }

    // Verificar que no ha excedido el máximo de usos
    if (inviteCode.usos_totales >= inviteCode.usos_max) {
      return NextResponse.json(
        { error: 'Código de invitación ya ha alcanzado el máximo de usos' },
        { status: 400 },
      );
    }

    // Obtener datos del evento
    const evento = await prisma.eventos.findUnique({
      where: { eventoid: inviteCode.eventoid },
      select: {
        eventoid: true,
        titulo: true,
        descripcion: true,
      },
    });

    return NextResponse.json({
      valid: true,
      eventoid: inviteCode.eventoid,
      titulo: evento?.titulo,
    });
  } catch (error) {
    console.error('Error validating invite code:', error);
    return NextResponse.json({ error: 'Error validando código de invitación' }, { status: 500 });
  }
}
