import { prisma } from '@repo/db';

export interface CreateEventData {
  titulo: string;
  descripcion?: string;
  ubicacion?: string;
  fecha_inicio_venta: Date;
  fecha_fin_venta: Date;
  estado?: 'ACTIVO' | 'CANCELADO' | 'COMPLETADO' | 'OCULTO';
  imageUrl?: string;
  galeria_imagenes?: string[];
  fechas_adicionales?: Array<{
    fecha_inicio: Date;
    fecha_fin: Date;
  }>;
  eventMap?: {
    sectors: Array<{
      id: string;
      name: string;
      type: 'general' | 'vip' | 'premium' | 'custom';
      color: string;
      x: number;
      y: number;
      width: number;
      height: number;
      capacity?: number;
      price?: number;
      isGrid?: boolean;
      rows?: number;
      columns?: number;
    }>;
    elements?: Array<{
      id: string;
      name: string;
      type: 'stage' | 'bathroom' | 'bar' | 'entrance' | 'exit' | 'parking' | 'custom';
      icon: string;
      x: number;
      y: number;
      width: number;
      height: number;
      color: string;
    }>;
    backgroundImage?: string;
  };
  clerkUserId: string;
}

export interface EventWithImages {
  id_evento: string;
  titulo: string;
  descripcion?: string;
  ubicacion?: string;
  fecha_creacion?: Date;
  fecha_inicio_venta: Date;
  fecha_fin_venta: Date;
  estado?: 'ACTIVO' | 'CANCELADO' | 'COMPLETADO' | 'OCULTO';
  mapa_evento?: any; // JSON del mapa de evento
  id_creador: string;
  imagenes_evento: Array<{
    id_imagen: string;
    url: string;
    tipo?: string;
  }>;
  fechas_evento?: Array<{
    id_fecha: string;
    fecha_hora: Date;
  }>;
}

export class EventService {
  static async createEvent(data: CreateEventData): Promise<EventWithImages> {
    try {
      await prisma.usuario.upsert({
        where: { id_usuario: data.clerkUserId },
        update: {},
        create: {
          id_usuario: data.clerkUserId,
          nombre: 'Usuario',
          apellido: 'Clerk',
          email: `${data.clerkUserId}@clerk.user`,
        },
      });

      // Crear el evento
      const evento = await prisma.evento.create({
        data: {
          titulo: data.titulo,
          descripcion: data.descripcion,
          ubicacion: data.ubicacion,
          fecha_inicio_venta: data.fecha_inicio_venta,
          fecha_fin_venta: data.fecha_fin_venta,
          estado: data.estado || 'OCULTO',
          mapa_evento: data.eventMap ? JSON.stringify(data.eventMap) : null,
          id_creador: data.clerkUserId,
        },
      });

      // Crear imágenes del evento
      const imagenesData = [];

      // Imagen de portada
      if (data.imageUrl) {
        imagenesData.push({
          id_evento: evento.id_evento,
          url: data.imageUrl,
          tipo: 'portada',
        });
      }

      // Imágenes de galería
      if (data.galeria_imagenes && data.galeria_imagenes.length > 0) {
        data.galeria_imagenes.forEach(url => {
          imagenesData.push({
            id_evento: evento.id_evento,
            url: url,
            tipo: 'galeria',
          });
        });
      }

      // Crear todas las imágenes en batch
      if (imagenesData.length > 0) {
        await prisma.imagenEvento.createMany({
          data: imagenesData,
        });
      }

      // Crear fechas adicionales del evento
      if (data.fechas_adicionales && data.fechas_adicionales.length > 0) {
        const fechasData = data.fechas_adicionales.map(fecha => ({
          id_evento: evento.id_evento,
          fecha_hora: fecha.fecha_inicio,
        }));

        await prisma.fechaEvento.createMany({
          data: fechasData,
        });
      }

      // set estadísticas iniciales para el evento
      await prisma.estadistica.create({
        data: {
          id_evento: evento.id_evento,
          total_vendidos: 0,
          total_cancelados: 0,
          total_ingresos: 0,
        },
      });

      // set cola de evento
      await prisma.colaEvento.create({
        data: {
          id_evento: evento.id_evento,
          max_concurrentes: 10,
          max_usuarios: 100,
        },
      });

      // get evento con sus imágenes y fechas
      const eventoCompleto = await prisma.evento.findUnique({
        where: { id_evento: evento.id_evento },
        include: {
          imagenes_evento: true,
          fechas_evento: true,
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

  static async getEventById(id: string): Promise<EventWithImages | null> {
    try {
      const evento = await prisma.evento.findUnique({
        where: { id_evento: id },
        include: {
          imagenes_evento: true,
          fechas_evento: true,
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

  static async getUserEvents(clerkUserId: string): Promise<EventWithImages[]> {
    try {
      const eventos = await prisma.evento.findMany({
        where: {
          id_creador: clerkUserId,
        },
        include: {
          imagenes_evento: true,
          fechas_evento: true,
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
