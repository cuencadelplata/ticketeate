import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Tipos TypeScript para la API de eventos
export interface Evento {
  id: string;
  titulo: string;
  descripcion: string;
  fechaInicio: string; // ISO
  fechaFin: string; // ISO
  ubicacion: string;
  precio: number;
  capacidad: number;
  disponibles: number;
  categoria: Categoria;
  imagenes: ImagenEvento[];
  estado: 'activo' | 'cancelado' | 'completado';
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

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
  filtros?: FiltrosEventos
): Promise<RespuestaPaginada<Evento>> {
  try {
    const { pagina, limite } = paginacion;
    const skip = (pagina - 1) * limite;

    // Construir filtros de consulta
    const where: any = {
      estado: 'activo', // Solo eventos activos
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
      prisma.evento.findMany({
        where,
        include: {
          categoria: true,
          imagenes: true,
        },
        skip,
        take: limite,
        orderBy: {
          fechaInicio: 'asc',
        },
      }),
      prisma.evento.count({ where }),
    ]);

  // Calcular disponibilidad para cada evento en paralelo
  const eventosTyped: any[] = eventos as any[];
  const disponiblesArr = await Promise.all(eventosTyped.map((ev: any) => calcularDisponibilidad(ev.id)));

  const datos: Evento[] = eventosTyped.map((ev: any, idx: number) => ({
      id: ev.id,
      titulo: ev.titulo,
      descripcion: ev.descripcion,
      fechaInicio: ev.fechaInicio instanceof Date ? ev.fechaInicio.toISOString() : String(ev.fechaInicio),
      fechaFin: ev.fechaFin instanceof Date ? ev.fechaFin.toISOString() : String(ev.fechaFin),
      ubicacion: ev.ubicacion,
      precio: ev.precio,
      capacidad: ev.capacidad,
      disponibles: disponiblesArr[idx] ?? 0,
      categoria: ev.categoria,
      imagenes: ev.imagenes || [],
      estado: ev.estado,
      createdAt: ev.createdAt instanceof Date ? ev.createdAt.toISOString() : String(ev.createdAt),
      updatedAt: ev.updatedAt instanceof Date ? ev.updatedAt.toISOString() : String(ev.updatedAt),
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
export async function obtenerDetalleEvento(id: string): Promise<Evento> {
  try {
    // Usar findFirst para poder filtrar por estado además del id
    const evento = await prisma.evento.findFirst({
      where: {
        id,
        estado: 'activo', // Solo eventos activos
      },
      include: {
        categoria: true,
        imagenes: {
          orderBy: {
            esPrincipal: 'desc', // Imagen principal primero
          },
        },
      },
    });

    if (!evento) {
      throw new Error('Evento no encontrado o no disponible');
    }

    // Calcular disponibilidad en tiempo real
    const disponibles = await calcularDisponibilidad(evento.id);

    const mapped: Evento = {
      id: evento.id,
      titulo: evento.titulo,
      descripcion: evento.descripcion,
      fechaInicio: evento.fechaInicio instanceof Date ? evento.fechaInicio.toISOString() : String(evento.fechaInicio),
      fechaFin: evento.fechaFin instanceof Date ? evento.fechaFin.toISOString() : String(evento.fechaFin),
      ubicacion: evento.ubicacion,
      precio: evento.precio,
      capacidad: evento.capacidad,
      disponibles,
      categoria: evento.categoria,
      imagenes: evento.imagenes || [],
      estado: evento.estado,
      createdAt: evento.createdAt instanceof Date ? evento.createdAt.toISOString() : String(evento.createdAt),
      updatedAt: evento.updatedAt instanceof Date ? evento.updatedAt.toISOString() : String(evento.updatedAt),
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
    const evento = await prisma.evento.findUnique({
      where: { id: eventoId },
      select: { capacidad: true },
    });

    if (!evento) {
      return 0;
    }

    const reservasConfirmadas = await prisma.reserva.count({
      where: {
        eventoId: eventoId,
        estado: 'confirmada',
      },
    });

    return Math.max(0, evento.capacidad - reservasConfirmadas);
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
    if (params.get('fechaInicio')) filtros.fechaInicio = new Date(params.get('fechaInicio') as string);
    if (params.get('fechaFin')) filtros.fechaFin = new Date(params.get('fechaFin') as string);
    if (params.get('ubicacion')) filtros.ubicacion = params.get('ubicacion') as string;
    if (params.get('categoriaId')) filtros.categoriaId = params.get('categoriaId') as string;
    if (params.get('precioMin')) filtros.precioMin = Number(params.get('precioMin'));
    if (params.get('precioMax')) filtros.precioMax = Number(params.get('precioMax'));

    const resultado = await listarEventos({ pagina: Math.max(1, pagina), limite: Math.max(1, limite) }, filtros);
    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Error en GET /api/get-events:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
