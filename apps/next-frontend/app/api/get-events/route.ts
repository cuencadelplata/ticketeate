// No se puede importar el módulo '../../../packages/db/src' porque no se encuentra o no tiene declaraciones de tipo correspondientes.
// Puedes comentar o eliminar la línea de importación para evitar el error de compilación.

import { prisma } from '@/lib/prisma';

// import { prisma } from '../../../packages/db/src';

// Tipos TypeScript para la API de eventos
export interface Evento {
  id: string;
  titulo: string;
  descripcion: string;
  fechaInicio: Date;
  fechaFin: Date;
  ubicacion: string;
  precio: number;
  capacidad: number;
  disponibles: number;
  categoria: Categoria;
  imagenes: ImagenEvento[];
  estado: 'activo' | 'cancelado' | 'completado';
  createdAt: Date;
  updatedAt: Date;
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

    const totalPaginas = Math.ceil(total / limite);

    return {
      datos: eventos,
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
    const evento = await prisma.evento.findUnique({
      where: {
        id: id,
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

    return {
      ...evento,
      disponibles,
    };
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
