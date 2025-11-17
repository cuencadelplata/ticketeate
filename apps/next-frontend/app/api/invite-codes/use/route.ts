import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Obtener la sesión del usuario
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { codigo } = await request.json();

    if (!codigo || typeof codigo !== 'string') {
      return NextResponse.json({ error: 'Código de invitación requerido' }, { status: 400 });
    }

    const normalizedCode = codigo.trim().toUpperCase();

    // Buscar el código de invitación
    const inviteCode = await prisma.invite_codes.findFirst({
      where: {
        codigo: normalizedCode,
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

    // Verificar si el usuario ya es colaborador de este evento
    const existingColaborador = await prisma.colaborador_eventos.findFirst({
      where: {
        eventoid: inviteCode.eventoid,
        usuarioid: session.user.id,
      },
    });

    if (existingColaborador) {
      return NextResponse.json({ error: 'Ya eres colaborador de este evento' }, { status: 400 });
    }

    const [newColaborador, updatedInviteCode, evento] = await prisma.$transaction([
      prisma.colaborador_eventos.create({
        data: {
          eventoid: inviteCode.eventoid,
          usuarioid: session.user.id,
          invite_code_used: normalizedCode,
        },
      }),
      prisma.invite_codes.update({
        where: { codigoid: inviteCode.codigoid },
        data: {
          usos_totales: {
            increment: 1,
          },
        },
      }),
      prisma.eventos.findUnique({
        where: { eventoid: inviteCode.eventoid },
        select: {
          eventoid: true,
          titulo: true,
        },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: '¡Código validado! Ahora eres colaborador del evento',
        eventoid: inviteCode.eventoid,
        evento: evento ?? null,
        colaborador_evento_id: newColaborador.colaborador_evento_id,
        usos_totales: updatedInviteCode.usos_totales,
        usos_max: updatedInviteCode.usos_max,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error using invite code:', error);
    return NextResponse.json({ error: 'Error al validar código de invitación' }, { status: 500 });
  }
}
