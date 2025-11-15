import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { Event } from '@/types/events';

export interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
}

export interface ImagenEvento {
  id: string;
  url: string;
  alt: string;
  esPrincipal: boolean;
}

export interface PaginacionParams {
  pagina: number;
  limite: number;
}

export interface FiltrosEventos {
  fechaInicio?: Date;
  fechaFin?: Date;
  ubicacion?: string;
  categoriaId?: string;
  precioMin?: number;
  precioMax?: number;
}

export interface RespuestaPaginada<T> {
  datos: T[];
  paginacion: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}

// Función para listar eventos con paginación
export async function listarEventos(
  paginacion: PaginacionParams,
  filtros?: FiltrosEventos,
): Promise<RespuestaPaginada<Event>> {
  try {
    const { pagina, limite } = paginacion;
    const skip = (pagina - 1) * limite;

    // Construir filtros de consulta
    const where: any = {
      // estado: 'activo', // Solo eventos activos - TODO: revisar lógica de estados
    };

    if (filtros?.fechaInicio) {
      where.fechaInicio = {
        gte: filtros.fechaInicio,
      };
    }

    if (filtros?.fechaFin) {
      where.fechaFin = {
        lte: filtros.fechaFin,
      };
    }

    if (filtros?.ubicacion) {
      where.ubicacion = {
        contains: filtros.ubicacion,
        mode: 'insensitive',
      };
    }

    if (filtros?.categoriaId) {
      where.categoriaId = filtros.categoriaId;
    }

    if (filtros?.precioMin !== undefined || filtros?.precioMax !== undefined) {
      where.precio = {};
      if (filtros.precioMin !== undefined) {
        where.precio.gte = filtros.precioMin;
      }
      if (filtros.precioMax !== undefined) {
        where.precio.lte = filtros.precioMax;
      }
    }

    // Ejecutar consulta con paginación
    const [eventos, total] = await Promise.all([
      prisma.eventos.findMany({
        where,
        include: {
          evento_categorias: {
            include: {
              categoriaevento: true,
            },
          },
          imagenes_evento: true,
        },
        skip,
        take: limite,
        orderBy: {
          fecha_creacion: 'desc',
        },
      }),
      prisma.eventos.count({ where }),
    ]);

    // Calcular disponibilidad para cada evento en paralelo
    const eventosTyped: any[] = eventos as any[];
    await Promise.all(eventosTyped.map((ev: any) => calcularDisponibilidad(ev.eventoid)));

    const datos: Event[] = eventosTyped.map((ev: any) => ({
      eventoid: ev.eventoid,
      titulo: ev.titulo,
      descripcion: ev.descripcion || undefined,
      ubicacion: ev.ubicacion,
      fecha_creacion: ev.fecha_creacion,
      fecha_publicacion: ev.fecha_publicacion || undefined,
      creadorid: ev.creadorid,
      mapa_evento: ev.mapa_evento || {},
      fecha_cambio: ev.fecha_cambio,
      views: ev.views || 0,
      imagenes_evento: ev.imagenes_evento || [],
    }));

    const totalPaginas = Math.ceil(total / limite);

    return {
      datos,
      paginacion: {
        pagina,
        limite,
        total,
        totalPaginas,
      },
    };
  } catch (error) {
    console.error('Error al listar eventos:', error);
    throw new Error('Error interno del servidor al obtener eventos');
  }
}

// Función para obtener detalle de un evento específico
export async function obtenerDetalleEvento(id: string): Promise<Event> {
  try {
    // Usar findFirst para poder filtrar por estado además del id
    const evento = await prisma.eventos.findFirst({
      where: {
        eventoid: id,
      },
      include: {
        evento_categorias: {
          include: {
            categoriaevento: true,
          },
        },
        imagenes_evento: {
          orderBy: {
            tipo: 'asc', // Ordenar por tipo
          },
        },
      },
    });

    if (!evento) {
      throw new Error('Evento no encontrado o no disponible');
    }

    // Calcular disponibilidad en tiempo real
    await calcularDisponibilidad(evento.eventoid);

    const mapped: Event = {
      eventoid: evento.eventoid,
      titulo: evento.titulo,
      descripcion: evento.descripcion || undefined,
      ubicacion: evento.ubicacion,
      fecha_creacion: evento.fecha_creacion,
      fecha_publicacion: evento.fecha_publicacion || undefined,
      creadorid: evento.creadorid,
      mapa_evento: (evento.mapa_evento as Record<string, unknown>) || {},
      fecha_cambio: evento.fecha_cambio,
      views: evento.views || 0,
      imagenes_evento: evento.imagenes_evento || [],
    };

    return mapped;
  } catch (error) {
    console.error('Error al obtener detalle del evento:', error);
    if (error instanceof Error && error.message === 'Evento no encontrado o no disponible') {
      throw error;
    }
    throw new Error('Error interno del servidor al obtener detalle del evento');
  }
}

// Función auxiliar para calcular disponibilidad en tiempo real
export async function calcularDisponibilidad(eventoId: string): Promise<number> {
  try {
    // Obtener la capacidad total del evento desde stock_entrada
    const stockTotal = await prisma.stock_entrada.aggregate({
      where: { eventoid: eventoId },
      _sum: { cant_max: true },
    });

    const capacidadTotal = stockTotal._sum.cant_max || 0;

    const reservasConfirmadas = await prisma.reservas.count({
      where: {
        eventoid: eventoId,
        estado: 'confirmada',
      },
    });

    return Math.max(0, capacidadTotal - reservasConfirmadas);
  } catch (error) {
    console.error('Error al calcular disponibilidad:', error);
    return 0;
  }
}

// Next.js route handler
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const params = url.searchParams;

    // Si se solicita por id, devolver detalle
    const id = params.get('id');
    if (id) {
      try {
        const detalle = await obtenerDetalleEvento(id);
        return NextResponse.json(detalle);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Evento no encontrado';
        return NextResponse.json({ error: message }, { status: 404 });
      }
    }

    // Paginación y filtros
    const pagina = Number(params.get('page') ?? params.get('pagina') ?? '1');
    const limite = Number(params.get('limit') ?? params.get('limite') ?? '10');

    const filtros: FiltrosEventos = {};
    if (params.get('fechaInicio'))
      filtros.fechaInicio = new Date(params.get('fechaInicio') as string);
    if (params.get('fechaFin')) filtros.fechaFin = new Date(params.get('fechaFin') as string);
    if (params.get('ubicacion')) filtros.ubicacion = params.get('ubicacion') as string;
    if (params.get('categoriaId')) filtros.categoriaId = params.get('categoriaId') as string;
    if (params.get('precioMin')) filtros.precioMin = Number(params.get('precioMin'));
    if (params.get('precioMax')) filtros.precioMax = Number(params.get('precioMax'));

    const resultado = await listarEventos(
      { pagina: Math.max(1, pagina), limite: Math.max(1, limite) },
      filtros,
    );
    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Error en GET /api/get-events:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
