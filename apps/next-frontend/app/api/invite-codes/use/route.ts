import { auth } from '@/lib/auth';
import { db } from '@ticketeate/db';

export const dynamic = 'force-dynamic';

interface UseInviteCodeResponse {
  success: boolean;
  message: string;
  eventoid?: string;
  colaborador_evento_id?: string;
  error?: string;
}

export async function POST(request: Request): Promise<Response> {
  try {
    // Obtener la sesión del usuario
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return Response.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    const { codigo } = await request.json();

    if (!codigo || typeof codigo !== 'string') {
      return Response.json({ error: 'Código de invitación requerido' }, { status: 400 });
    }

    const codigoTrimmed = codigo.trim().toUpperCase();

    // Buscar el código en la base de datos
    const inviteCode = await db.invite_codes.findFirst({
      where: {
        codigo: codigoTrimmed,
        estado: 'ACTIVO',
        fecha_expiracion: {
          gt: new Date(),
        },
      },
    });

    if (!inviteCode) {
      return Response.json({ error: 'Código de invitación no válido o expirado' }, { status: 401 });
    }

    // Verificar que no ha excedido el máximo de usos
    if (inviteCode.usos_totales >= inviteCode.usos_max) {
      return Response.json(
        { error: 'Código de invitación ya ha alcanzado el máximo de usos' },
        { status: 401 },
      );
    }

    // Verificar si el usuario ya es colaborador de este evento
    const existingColaborador = await db.colaborador_eventos.findFirst({
      where: {
        eventoid: inviteCode.eventoid,
        usuarioid: session.user.id,
      },
    });

    if (existingColaborador) {
      return Response.json({ error: 'Ya eres colaborador de este evento' }, { status: 400 });
    }

    // Crear el registro de colaborador_eventos
    const colaborador = await db.colaborador_eventos.create({
      data: {
        eventoid: inviteCode.eventoid,
        usuarioid: session.user.id,
        invite_code_used: inviteCode.codigoid,
      },
    });

    // Incrementar el contador de usos del código
    await db.invite_codes.update({
      where: {
        codigoid: inviteCode.codigoid,
      },
      data: {
        usos_totales: {
          increment: 1,
        },
      },
    });

    return Response.json({
      success: true,
      message: 'Te has registrado como colaborador correctamente',
      eventoid: inviteCode.eventoid,
      colaborador_evento_id: colaborador.colaborador_evento_id,
    } as UseInviteCodeResponse);
  } catch (error) {
    console.error('Error using invite code:', error);
    return Response.json({ error: 'Error al usar código de invitación' }, { status: 500 });
  }
}
