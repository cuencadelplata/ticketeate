import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@repo/db';
import { auth } from '@/lib/auth';

// Endpoint para obtener los eventos donde el usuario es colaborador
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
    }

    // Obtener los eventos donde el usuario es colaborador
    const colaboradorEventos = await prisma.colaborador_eventos.findMany({
      where: {
        usuarioid: session.user.id,
      },
      include: {
        eventos: {
          select: {
            eventoid: true,
            titulo: true,
            descripcion: true,
            ubicacion: true,
            stock_entrada: true,
            fechas_evento: true,
          },
        },
      },
    });

    const eventos = colaboradorEventos.map((ce: any) => ce.eventos);

    console.log(`🔍 Colaborador ${session.user.id} tiene ${eventos.length} eventos`);

    return NextResponse.json(
      {
        message: 'Eventos obtenidos',
        eventos,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error obteniendo eventos del colaborador:', error);
    return NextResponse.json(
      {
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
