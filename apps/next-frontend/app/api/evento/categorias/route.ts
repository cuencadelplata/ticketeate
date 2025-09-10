import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/evento/categorias?id_evento=...
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const idEvento = url.searchParams.get('id_evento') || url.searchParams.get('eventoId');

    if (!idEvento) {
      return NextResponse.json({ error: 'Falta parámetro id_evento' }, { status: 400 });
    }

    const evento = await prisma.evento.findUnique({
      where: { id_evento: String(idEvento) },
      select: { id_evento: true },
    });
    if (!evento) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    const categorias = await prisma.categoriaEntrada.findMany({
      where: { id_evento: String(idEvento) },
      select: {
        id_categoria: true,
        nombre: true,
        descripcion: true,
        precio: true,
        stock_total: true,
        stock_disponible: true,
        max_por_usuario: true,
      },
      orderBy: { precio: 'asc' },
    });

    const result = categorias.map((c: any) => ({
      id_categoria: c.id_categoria,
      nombre: c.nombre,
      descripcion: c.descripcion ?? null,
      precio: Number(c.precio),
      stock_total: c.stock_total,
      stock_disponible: c.stock_disponible,
      max_por_usuario: c.max_por_usuario,
    }));

    return NextResponse.json({ categorias: result });
  } catch (error) {
    console.error('Error en GET /api/evento/categorias', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
