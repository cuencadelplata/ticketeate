import { prisma } from '../config/prisma';

export interface CreateEventData {
  titulo: string;
  descripcion?: string;
  ubicacion?: string;
  fecha_inicio_venta: Date;
  fecha_fin_venta: Date;
  estado?: string;
  imageUrl?: string;
  clerkUserId: string;
}

export interface EventWithImages {
  id_evento: bigint;
  titulo: string;
  descripcion?: string;
  ubicacion?: string;
  fecha_creacion?: Date;
  fecha_inicio_venta: Date;
  fecha_fin_venta: Date;
  estado?: string;
  imagenes_evento: Array<{
    id_imagen: bigint;
    url: string;
    tipo?: string;
  }>;
}

export class EventService {
  static async createEvent(data: CreateEventData): Promise<EventWithImages> {
    try {
      // Crear el evento
      const evento = await prisma.eventos.create({
        data: {
          titulo: data.titulo,
          descripcion: data.descripcion,
          ubicacion: data.ubicacion,
          fecha_inicio_venta: data.fecha_inicio_venta,
          fecha_fin_venta: data.fecha_fin_venta,
          estado: data.estado || 'oculto',
        },
      });

      // Si hay una imagen, guardarla en la base de datos
      if (data.imageUrl) {
        await prisma.imagenes_evento.create({
          data: {
            id_evento: evento.id_evento,
            url: data.imageUrl,
            tipo: 'portada',
          },
        });
      }

      // Crear estadísticas iniciales para el evento
      await prisma.estadisticas.create({
        data: {
          id_evento: evento.id_evento,
          total_vendidos: 0,
          total_cancelados: 0,
          total_ingresos: 0,
        },
      });

      // Crear cola de evento
      await prisma.colas_evento.create({
        data: {
          id_evento: evento.id_evento,
          max_concurrentes: 10,
          max_usuarios: 100,
        },
      });

      // Obtener el evento con sus imágenes
      const eventoCompleto = await prisma.eventos.findUnique({
        where: { id_evento: evento.id_evento },
        include: {
          imagenes_evento: true,
        },
      });

      if (!eventoCompleto) {
        throw new Error('Error al recuperar el evento creado');
      }

      return eventoCompleto as EventWithImages;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating event:', error);
      throw new Error(
        `Error al crear el evento: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  static async getEventById(id: bigint): Promise<EventWithImages | null> {
    try {
      const evento = await prisma.eventos.findUnique({
        where: { id_evento: id },
        include: {
          imagenes_evento: true,
        },
      });

      return evento as EventWithImages | null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error getting event:', error);
      throw new Error(
        `Error al obtener el evento: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  static async getUserEvents(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _clerkUserId: string
  ): Promise<EventWithImages[]> {
    try {
      // Por ahora, retornamos todos los eventos
      // En el futuro, podrías agregar una tabla de relación usuario-evento
      const eventos = await prisma.eventos.findMany({
        include: {
          imagenes_evento: true,
        },
        orderBy: {
          fecha_creacion: 'desc',
        },
      });

      return eventos as EventWithImages[];
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error getting user events:', error);
      throw new Error(
        `Error al obtener los eventos del usuario: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
