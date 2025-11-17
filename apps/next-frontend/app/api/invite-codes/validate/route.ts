import { auth } from '@/lib/auth';
import { db } from '@ticketeate/db';

export const dynamic = 'force-dynamic';

interface ValidateInviteCodeResponse {
  valid: boolean;
  eventoid?: string;
  evento?: {
    eventoid: string;
    nombre: string;
    descripcion: string;
    fecha_inicio: string;
  };
  error?: string;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const { codigo } = await request.json();

    if (!codigo || typeof codigo !== 'string') {
      return Response.json({ error: 'Código de invitación requerido' }, { status: 400 });
    }

    // Buscar el código en la base de datos
    const inviteCode = await db.invite_codes.findFirst({
      where: {
        codigo: codigo.trim().toUpperCase(),
        estado: 'ACTIVO',
        fecha_expiracion: {
          gt: new Date(), // Mayor que la fecha actual
        },
      },
      include: {
        eventos: {
          select: {
            eventoid: true,
            nombre: true,
            descripcion: true,
            fecha_inicio: true,
          },
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

    return Response.json({
      valid: true,
      eventoid: inviteCode.eventoid,
      evento: inviteCode.eventos,
    } as ValidateInviteCodeResponse);
  } catch (error) {
    console.error('Error validating invite code:', error);
    return Response.json({ error: 'Error validando código de invitación' }, { status: 500 });
  }
}
