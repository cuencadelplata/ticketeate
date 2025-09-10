import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'ID de evento requerido' }, { status: 400 });
    }

    // Buscar el evento con todas sus relaciones
    const evento = await prisma.evento.findFirst({
      where: {
        id_evento: id,
        estado: 'activo',
      },
      include: {
        fechas_evento: true,
        categorias_entrada: true,
        imagenes_evento: true,
        mapa_evento: true,
      },
    });

    if (!evento) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    // Calcular disponibilidad en tiempo real para cada categoría
    const categoriasConDisponibilidad = await Promise.all(
      evento.categorias_entrada.map(async (categoria) => {
        const reservasConfirmadas = await prisma.reserva.count({
          where: {
            eventoId: evento.id_evento,
            categoriaId: categoria.id_categoria,
            estado: 'confirmada',
          },
        });

        return {
          ...categoria,
          stock_disponible: Math.max(0, categoria.stock_total - reservasConfirmadas),
        };
      }),
    );

    // Preparar respuesta
    const response = {
      event: {
        ...evento,
        categorias_entrada: categoriasConDisponibilidad,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error en GET /api/events/public/[id]:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
