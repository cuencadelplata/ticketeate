import { db } from '@ticketeate/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Verificar que la tabla invite_codes existe
    const inviteCodesCount = await db.invite_codes.count();
    const colaboradoresCount = await db.colaborador_eventos.count();

    // Obtener los primeros 5 códigos de invitación
    const inviteCodes = await db.invite_codes.findMany({
      take: 5,
      include: {
        eventos: {
          select: {
            eventoid: true,
            nombre: true,
          },
        },
      },
    });

    return Response.json({
      status: 'ok',
      inviteCodesCount,
      colaboradoresCount,
      recentInviteCodes: inviteCodes,
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return Response.json({ error: 'Error in debug endpoint' }, { status: 500 });
  }
}
