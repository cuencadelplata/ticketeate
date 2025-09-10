import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/evento/detalle?id_evento=...
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const idEvento = url.searchParams.get('id_evento') || url.searchParams.get('eventoId');
    if (!idEvento) {
      return NextResponse.json({ error: 'Falta parámetro id_evento' }, { status: 400 });
    }

    const evento = await prisma.evento.findUnique({
      where: { id_evento: String(idEvento) },
      select: {
        id_evento: true,
        titulo: true,
        descripcion: true,
        ubicacion: true,
        fecha_inicio_venta: true,
        fecha_fin_venta: true,
      },
    });

    if (!evento) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    // Normalizar fechas a ISO
    const result = {
      ...evento,
      fecha_inicio_venta: evento.fecha_inicio_venta?.toISOString?.() ?? evento.fecha_inicio_venta,
      fecha_fin_venta: evento.fecha_fin_venta?.toISOString?.() ?? evento.fecha_fin_venta,
    } as any;

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error en GET /api/evento/detalle', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
