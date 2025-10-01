import { prisma } from '../config/prisma';
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
  fecha_inicio_venta: Date;
  fecha_fin_venta: Date;
  estado?: 'ACTIVO' | 'CANCELADO' | 'COMPLETADO' | 'OCULTO';
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
}

export class EventService {
  static async createEvent(data: CreateEventData): Promise<EventWithImages> {
    try {
      await prisma.usuario.upsert({
        where: { usuarioid: data.clerkUserId },
        update: {},
        create: {
          usuarioid: data.clerkUserId,
          nombre: 'Usuario',
          apellido: 'Clerk',
          email: `${data.clerkUserId}@clerk.user`,
        },
      });

      // Crear el evento
      const evento = await prisma.evento.create({
        data: {
          eventoid: randomUUID(),
          titulo: data.titulo,
          descripcion: data.descripcion,
          ubicacion: data.ubicacion,
          fecha_inicio_venta: data.fecha_inicio_venta,
          fecha_fin_venta: data.fecha_fin_venta,
          estado: data.estado || 'OCULTO',
          mapa_evento: data.eventMap ?? undefined,
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
        await prisma.imagenEvento.createMany({
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

        await prisma.fechaEvento.createMany({
          data: fechasData,
        });
      }

      // Crear categorías de entrada (tipos de tickets) si se enviaron
      if (data.ticket_types && data.ticket_types.length > 0) {
        await prisma.categoriaEntrada.createMany({
          data: data.ticket_types.map((t) => ({
            categoriaid: randomUUID(),
            eventoid: evento.eventoid,
            nombre: t.nombre,
            descripcion: t.descripcion ?? null,
            precio: t.precio,
            stock_total: t.stock_total,
            stock_disponible: t.stock_total,
          })),
        });
      }

      // set estadísticas iniciales para el evento
      await prisma.estadistica.create({
        data: {
          estadisticaid: randomUUID(),
          eventoid: evento.eventoid,
          total_vendidos: 0,
          total_cancelados: 0,
          total_ingresos: 0,
        },
      });

      // set cola de evento
      await prisma.colaEvento.create({
        data: {
          colaid: randomUUID(),
          eventoid: evento.eventoid,
          max_concurrentes: 10,
          max_usuarios: 100,
        },
      });

      // get evento con sus imágenes y fechas
      const eventoCompleto = await prisma.evento.findUnique({
        where: { eventoid: evento.eventoid },
        include: {
          imagenes_evento: true,
          fechas_evento: true,
          categorias_entrada: true,
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

  static async updateEvent(
    id: string,
    clerkUserId: string,
    data: Partial<Omit<CreateEventData, 'clerkUserId'>>,
  ): Promise<EventWithImages> {
    try {
      const existing = await prisma.evento.findUnique({ where: { eventoid: id } });
      if (!existing) throw new Error('Evento no encontrado');
      if (existing.creadorid !== clerkUserId) throw new Error('No autorizado');

      const updated = await prisma.evento.update({
        where: { eventoid: id },
        data: {
          titulo: data.titulo ?? undefined,
          descripcion: data.descripcion ?? undefined,
          ubicacion: data.ubicacion ?? undefined,
          fecha_inicio_venta: data.fecha_inicio_venta ?? undefined,
          fecha_fin_venta: data.fecha_fin_venta ?? undefined,
          estado: data.estado ?? undefined,
          mapa_evento: data.eventMap ?? undefined,
        },
      });

      // Opcionales: actualizar imágenes principales sencillas (PORTADA + GALERIA)
      if (data.imageUrl || (data.galeria_imagenes && data.galeria_imagenes.length >= 0)) {
        // borrar existentes y recrear simples
        await prisma.imagenEvento.deleteMany({ where: { eventoid: id } });

        const images: Array<{ imagenid: string; eventoid: string; url: string; tipo: string }> = [];
        if (data.imageUrl) {
          images.push({
            imagenid: randomUUID(),
            eventoid: id,
            url: data.imageUrl,
            tipo: 'PORTADA',
          });
        }
        if (data.galeria_imagenes && data.galeria_imagenes.length > 0) {
          for (const url of data.galeria_imagenes) {
            images.push({ imagenid: randomUUID(), eventoid: id, url, tipo: 'GALERIA' });
          }
        }
        if (images.length > 0) {
          await prisma.imagenEvento.createMany({ data: images });
        }
      }

      // Opcional: actualizar fechas adicionales (reemplazo simple)
      if (data.fechas_adicionales) {
        await prisma.fechaEvento.deleteMany({ where: { eventoid: id } });
        const fechasData = data.fechas_adicionales.map((f) => ({
          fechaid: randomUUID(),
          eventoid: id,
          fecha_hora: f.fecha_inicio,
          fecha_fin: f.fecha_fin,
        }));
        if (fechasData.length > 0) await prisma.fechaEvento.createMany({ data: fechasData });
      }

      // Opcional: actualizar categorías/tickets (reemplazo simple)
      if (data.ticket_types) {
        await prisma.categoriaEntrada.deleteMany({ where: { eventoid: id } });
        if (data.ticket_types.length > 0) {
          await prisma.categoriaEntrada.createMany({
            data: data.ticket_types.map((t) => ({
              categoriaid: randomUUID(),
              eventoid: id,
              nombre: t.nombre,
              descripcion: t.descripcion ?? null,
              precio: t.precio,
              stock_total: t.stock_total,
              stock_disponible: t.stock_total,
            })),
          });
        }
      }

      const full = await prisma.evento.findUnique({
        where: { eventoid: updated.eventoid },
        include: { imagenes_evento: true, fechas_evento: true, categorias_entrada: true },
      });
      if (!full) throw new Error('Error al recuperar el evento actualizado');
      return full as EventWithImages;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating event:', error);
      throw new Error(
        `Error al actualizar el evento: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  static async softDeleteEvent(id: string, clerkUserId: string): Promise<void> {
    try {
      const existing = await prisma.evento.findUnique({ where: { eventoid: id } });
      if (!existing) throw new Error('Evento no encontrado');
      if (existing.creadorid !== clerkUserId) throw new Error('No autorizado');

      // Borrado lógico: marcar como CANCELADO y opcionalmente ocultar
      await prisma.evento.update({
        where: { eventoid: id },
        data: { estado: 'CANCELADO' },
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error deleting event:', error);
      throw new Error(
        `Error al eliminar el evento: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  static async getEventById(id: string): Promise<EventWithImages | null> {
    try {
      const evento = await prisma.evento.findUnique({
        where: { eventoid: id },
        include: {
          imagenes_evento: true,
          fechas_evento: true,
          categorias_entrada: true,
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
      const eventos = await prisma.evento.findMany({
        where: {
          creadorid: clerkUserId,
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
        `Error al obtener los eventos del usuario: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  static async getAllPublicEvents(): Promise<EventWithImages[]> {
    try {
      const now = new Date();
      const eventos = await prisma.evento.findMany({
        where: {
          OR: [
            { estado: 'COMPLETADO' },
            {
              estado: 'ACTIVO',
              fecha_inicio_venta: { lte: now },
            },
          ],
        },
        include: {
          imagenes_evento: true,
          fechas_evento: true,
          categorias_entrada: true,
        },
        orderBy: {
          fecha_inicio_venta: 'desc',
        },
      });

      return eventos as EventWithImages[];
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error getting all public events:', error);
      throw new Error(
        `Error al obtener todos los eventos: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  static async getPublicEventVisibleById(id: string): Promise<EventWithImages | null> {
    const now = new Date();
    const evento = await prisma.evento.findFirst({
      where: {
        eventoid: id,
        OR: [{ estado: 'COMPLETADO' }, { estado: 'ACTIVO', fecha_inicio_venta: { lte: now } }],
      },
      include: { imagenes_evento: true, fechas_evento: true, categorias_entrada: true },
    });
    return (evento as EventWithImages) ?? null;
  }

  static async listEventCategories(eventId: string) {
    const links = await prisma.catevento.findMany({
      where: { eventoid: eventId },
      include: { categoriaevento: true },
    });
    return links.map(
      (l: {
        categoriaeventoid: bigint;
        categoriaevento: { nombre: string; descripcion: string | null };
      }) => ({
        categoriaeventoid: l.categoriaeventoid,
        nombre: l.categoriaevento.nombre,
        descripcion: l.categoriaevento.descripcion ?? undefined,
      }),
    );
  }

  static async addCategoriesToEvent(
    eventId: string,
    categories: Array<{ id?: number; nombre?: string }>,
  ) {
    // ensure categories exist (by id or create by nombre)
    const ensuredIds: number[] = [];
    for (const c of categories) {
      if (c.id) {
        ensuredIds.push(c.id);
      } else if (c.nombre) {
        const up = await prisma.categoriaevento.upsert({
          where: { nombre: c.nombre },
          update: {},
          create: { nombre: c.nombre },
        });
        ensuredIds.push(Number(up.categoriaeventoid));
      }
    }
    // link
    for (const catId of ensuredIds) {
      await prisma.catevento.upsert({
        where: {
          eventoid_categoriaeventoid: { eventoid: eventId, categoriaeventoid: BigInt(catId) },
        },
        update: {},
        create: { eventoid: eventId, categoriaeventoid: BigInt(catId) },
      });
    }
    return this.listEventCategories(eventId);
  }

  static async removeCategoryFromEvent(eventId: string, categoryId: number) {
    await prisma.catevento.delete({
      where: {
        eventoid_categoriaeventoid: { eventoid: eventId, categoriaeventoid: BigInt(categoryId) },
      },
    });
    return this.listEventCategories(eventId);
  }
}
