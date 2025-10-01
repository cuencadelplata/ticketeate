import { prisma } from '@repo/db';

export interface CreateEventData {
  titulo: string;
  descripcion?: string;
  ubicacion: string;
  fecha_inicio_venta: Date;
  fecha_fin_venta: Date;
  estado?: string;
  imageUrl?: string;
  galeria_imagenes?: string[];
  fechas_adicionales?: Array<{
    fecha_inicio: Date;
    fecha_fin: Date;
  }>;
  eventMap?: any;
  clerkUserId: string;
  ticket_types?: any[];
}

export class EventService {
  /**
   * Obtiene todos los eventos públicos
   */
  static async getAllPublicEvents() {
    try {
      const eventos = await prisma.eventos.findMany({
        where: {
          evento_estado: {
            some: {
              Estado: 'ACTIVO',
            },
          },
        },
        include: {
          fechas_evento: true,
          imagenes_evento: true,
          stock_entrada: true,
          usuarios: {
            select: {
              nombre: true,
              apellido: true,
            },
          },
        },
        orderBy: {
          fecha_creacion: 'desc',
        },
      });

      return eventos.map(evento => ({
        id: evento.eventoid,
        titulo: evento.titulo,
        descripcion: evento.descripcion,
        ubicacion: evento.ubicacion,
        fecha_creacion: evento.fecha_creacion,
        creador: `${evento.usuarios.nombre} ${evento.usuarios.apellido}`,
        fechas: evento.fechas_evento,
        imagenes: evento.imagenes_evento,
        stock_entrada: evento.stock_entrada,
        mapa_evento: evento.mapa_evento,
      }));
    } catch (error) {
      console.error('Error getting public events:', error);
      throw new Error('Error al obtener los eventos públicos');
    }
  }

  /**
   * Obtiene un evento por ID
   */
  static async getEventById(eventId: string) {
    try {
      const evento = await prisma.eventos.findUnique({
        where: {
          eventoid: eventId,
        },
        include: {
          fechas_evento: true,
          imagenes_evento: true,
          stock_entrada: true,
          usuarios: {
            select: {
              nombre: true,
              apellido: true,
              email: true,
            },
          },
          evento_estado: {
            orderBy: {
              fecha_de_cambio: 'desc',
            },
            take: 1,
          },
        },
      });

      if (!evento) {
        return null;
      }

      return {
        id: evento.eventoid,
        titulo: evento.titulo,
        descripcion: evento.descripcion,
        ubicacion: evento.ubicacion,
        fecha_creacion: evento.fecha_creacion,
        creador: {
          id: evento.creadorid,
          nombre: `${evento.usuarios.nombre} ${evento.usuarios.apellido}`,
          email: evento.usuarios.email,
        },
        fechas: evento.fechas_evento,
        imagenes: evento.imagenes_evento,
        stock_entrada: evento.stock_entrada,
        mapa_evento: evento.mapa_evento,
        estado_actual: evento.evento_estado[0]?.Estado || 'OCULTO',
      };
    } catch (error) {
      console.error('Error getting event by ID:', error);
      throw new Error('Error al obtener el evento');
    }
  }

  /**
   * Obtiene eventos de un usuario específico
   */
  static async getUserEvents(userId: string) {
    try {
      const eventos = await prisma.eventos.findMany({
        where: {
          creadorid: userId,
        },
        include: {
          fechas_evento: true,
          imagenes_evento: true,
          stock_entrada: true,
          evento_estado: {
            orderBy: {
              fecha_de_cambio: 'desc',
            },
            take: 1,
          },
          _count: {
            select: {
              reservas: true,
            },
          },
        },
        orderBy: {
          fecha_creacion: 'desc',
        },
      });

      return eventos.map(evento => ({
        id: evento.eventoid,
        titulo: evento.titulo,
        descripcion: evento.descripcion,
        ubicacion: evento.ubicacion,
        fecha_creacion: evento.fecha_creacion,
        fechas: evento.fechas_evento,
        imagenes: evento.imagenes_evento,
        stock_entrada: evento.stock_entrada,
        mapa_evento: evento.mapa_evento,
        estado_actual: evento.evento_estado[0]?.Estado || 'OCULTO',
        total_reservas: evento._count.reservas,
      }));
    } catch (error) {
      console.error('Error getting user events:', error);
      throw new Error('Error al obtener los eventos del usuario');
    }
  }

  /**
   * Crea un nuevo evento
   */
  static async createEvent(data: CreateEventData) {
    try {
      // Generar IDs únicos
      const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const estadoId = `est_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Crear el evento
      const evento = await prisma.eventos.create({
        data: {
          eventoid: eventId,
          titulo: data.titulo,
          descripcion: data.descripcion,
          ubicacion: data.ubicacion,
          creadorid: data.clerkUserId,
          mapa_evento: data.eventMap || {},
        },
      });

      // Crear el estado inicial del evento
      await prisma.evento_estado.create({
        data: {
          stateventid: estadoId,
          eventoid: eventId,
          Estado: data.estado || 'OCULTO',
          usuarioid: data.clerkUserId,
        },
      });

      // Si hay fechas adicionales, crearlas
      if (data.fechas_adicionales && data.fechas_adicionales.length > 0) {
        const fechasData = data.fechas_adicionales.map((fecha, index) => ({
          fechaid: `fecha_${eventId}_${index}`,
          eventoid: eventId,
          fecha_hora: fecha.fecha_inicio,
          fecha_fin: fecha.fecha_fin,
        }));

        await prisma.fechas_evento.createMany({
          data: fechasData,
        });
      }

      // Si hay imagen de portada, crearla
      if (data.imageUrl) {
        await prisma.imagenes_evento.create({
          data: {
            imagenid: `img_${eventId}_portada`,
            eventoid: eventId,
            url: data.imageUrl,
            tipo: 'PORTADA',
          },
        });
      }

      // Si hay galería de imágenes, crearlas
      if (data.galeria_imagenes && data.galeria_imagenes.length > 0) {
        const imagenesData = data.galeria_imagenes.map((url, index) => ({
          imagenid: `img_${eventId}_galeria_${index}`,
          eventoid: eventId,
          url: url,
          tipo: 'GALERIA',
        }));

        await prisma.imagenes_evento.createMany({
          data: imagenesData,
        });
      }

      // Si hay tipos de tickets, crearlos
      if (data.ticket_types && data.ticket_types.length > 0) {
        const ticketsData = data.ticket_types.map((ticket, index) => ({
          stockid: `stock_${eventId}_${index}`,
          eventoid: eventId,
          nombre: ticket.name || `Entrada ${index + 1}`,
          precio: BigInt(ticket.price || 0),
          cant_max: ticket.capacity || 100,
        }));

        await prisma.stock_entrada.createMany({
          data: ticketsData,
        });
      }

      return evento;
    } catch (error) {
      console.error('Error creating event:', error);
      throw new Error('Error al crear el evento');
    }
  }
}
