import { prisma } from '@repo/db';
import { randomUUID } from 'node:crypto';

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
  ticket_types?: Array<{
    nombre: string;
    descripcion?: string;
    precio: number;
    stock_total: number;
  }>;
}

export interface EventWithImages {
  eventoid: string;
  titulo: string;
  descripcion?: string;
  ubicacion?: string;
  fecha_creacion?: Date;
  mapa_evento?: any;
  creadorid: string;
  imagenes_evento: Array<{
    imagenid: string;
    url: string;
    tipo?: string;
  }>;
  fechas_evento?: Array<{
    fechaid: string;
    fecha_hora: Date;
    fecha_fin?: Date;
  }>;
  stock_entrada?: Array<{
    stockid: string;
    nombre: string;
    precio: bigint;
    cant_max: number;
  }>;
  evento_estado?: Array<{
    stateventid: string;
    Estado: string;
    fecha_de_cambio: Date;
  }>;
}

export class EventService {
  static async createEvent(data: CreateEventData): Promise<EventWithImages> {
    try {
      await prisma.user.upsert({
        where: { id: data.clerkUserId },
        update: {},
        create: {
          id: data.clerkUserId,
          name: 'Usuario Clerk',
          email: `${data.clerkUserId}@clerk.user`,
          emailVerified: false,
          updatedAt: new Date(),
        },
      });

      // Crear el evento
      const evento = await prisma.eventos.create({
        data: {
          eventoid: randomUUID(),
          titulo: data.titulo,
          descripcion: data.descripcion,
          ubicacion: data.ubicacion || '',
          mapa_evento: data.eventMap ?? {},
          creadorid: data.clerkUserId,
        },
      });

      // Crear imágenes del evento
      const imagenesData: Array<{ imagenid: string; eventoid: string; url: string; tipo: string }> =
        [];

      // Imagen de portada
      if (data.imageUrl) {
        imagenesData.push({
          imagenid: randomUUID(),
          eventoid: evento.eventoid,
          url: data.imageUrl,
          tipo: 'PORTADA',
        });
      }

      // Imágenes de galería
      if (data.galeria_imagenes && data.galeria_imagenes.length > 0) {
        data.galeria_imagenes.forEach((url) => {
          imagenesData.push({
            imagenid: randomUUID(),
            eventoid: evento.eventoid,
            url: url,
            tipo: 'GALERIA',
          });
        });
      }

      // Crear todas las imágenes en batch
      if (imagenesData.length > 0) {
        await prisma.imagenes_evento.createMany({
          data: imagenesData,
        });
      }

      // Crear fechas adicionales del evento (inicio y fin)
      if (data.fechas_adicionales && data.fechas_adicionales.length > 0) {
        const fechasData = data.fechas_adicionales.map((fecha) => ({
          fechaid: randomUUID(),
          eventoid: evento.eventoid,
          fecha_hora: fecha.fecha_inicio,
          fecha_fin: fecha.fecha_fin,
        }));

        await prisma.fechas_evento.createMany({
          data: fechasData,
        });
      }

      // Crear categorías de entrada (tipos de tickets) si se enviaron
      if (data.ticket_types && data.ticket_types.length > 0) {
        await prisma.stock_entrada.createMany({
          data: data.ticket_types.map((t) => ({
            stockid: randomUUID(),
            eventoid: evento.eventoid,
            nombre: t.nombre,
            precio: BigInt(t.precio),
            cant_max: t.stock_total,
          })),
        });
      }

      // set estadísticas iniciales para el evento
      await prisma.estadisticas.create({
        data: {
          estadisticaid: randomUUID(),
          eventoid: evento.eventoid,
          total_vendidos: 0,
          total_cancelados: 0,
          total_ingresos: 0,
        },
      });

      // set cola de evento
      await prisma.colas_evento.create({
        data: {
          colaid: randomUUID(),
          eventoid: evento.eventoid,
          max_concurrentes: 10,
          max_usuarios: 100,
        },
      });

      // Crear estado inicial del evento
      await prisma.evento_estado.create({
        data: {
          stateventid: randomUUID(),
          eventoid: evento.eventoid,
          Estado: data.estado || 'OCULTO',
          usuarioid: data.clerkUserId,
        },
      });

      // get evento con sus imágenes y fechas
      const eventoCompleto = await prisma.eventos.findUnique({
        where: { eventoid: evento.eventoid },
        include: {
          imagenes_evento: true,
          fechas_evento: true,
          stock_entrada: true,
          evento_estado: {
            orderBy: {
              fecha_de_cambio: 'desc',
            },
            take: 1,
          },
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
        `Error al crear el evento: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  static async getEventById(id: string): Promise<EventWithImages | null> {
    try {
      const evento = await prisma.eventos.findUnique({
        where: { eventoid: id },
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
        `Error al obtener el evento: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  static async getUserEvents(clerkUserId: string): Promise<EventWithImages[]> {
    try {
      const eventos = await prisma.eventos.findMany({
        where: {
          creadorid: clerkUserId,
        },
        include: {
          imagenes_evento: true,
          fechas_evento: true,
          evento_estado: {
            orderBy: {
              fecha_de_cambio: 'desc',
            },
            take: 1,
          },
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
        `Error al obtener los eventos del usuario: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
