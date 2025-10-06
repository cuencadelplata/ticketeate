import { prisma } from '../config/prisma';
import { randomUUID } from 'node:crypto';

export interface CreateEventData {
  titulo: string;
  descripcion?: string;
  ubicacion?: string;
  estado?: 'ACTIVO' | 'CANCELADO' | 'COMPLETADO' | 'OCULTO';
  imageUrl?: string;
  galeria_imagenes?: string[];
  fechas_evento: Array<{
    fecha_hora: Date;
    fecha_fin?: Date;
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
  userId: string;
  ticket_types?: Array<{
    nombre: string;
    descripcion?: string;
    precio: number;
    stock_total: number;
  }>;
  categorias?: Array<{
    id?: number;
    nombre: string;
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
  fecha_cambio?: Date;
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
  evento_categorias?: Array<{
    categoriaeventoid: bigint;
    categoriaevento: {
      categoriaeventoid: bigint;
      nombre: string;
      descripcion?: string;
    };
  }>;
  evento_estado?: Array<{
    stateventid: string;
    Estado: string;
    fecha_de_cambio: Date;
    usuarioid: string;
  }>;
  stock_entrada?: Array<{
    stockid: string;
    nombre: string;
    precio: bigint;
    cant_max: number;
    fecha_creacion: Date;
    fecha_limite: Date;
  }>;
}

export class EventService {
  // Método para asegurar que existe una categoría por defecto
  private static async ensureDefaultCategory(): Promise<bigint> {
    // Buscar si ya existe una categoría por defecto
    let categoriaDefault = await prisma.categoriaevento.findFirst({
      where: { nombre: 'General' }
    });

    if (!categoriaDefault) {
      // Crear categoría por defecto
      categoriaDefault = await prisma.categoriaevento.create({
        data: {
          nombre: 'General',
          descripcion: 'Categoría por defecto para eventos'
        }
      });
    }

    return BigInt(categoriaDefault.categoriaeventoid);
  }

  static async createEvent(data: CreateEventData): Promise<EventWithImages> {
    try {
      await prisma.user.upsert({
        where: { id: data.userId },
        update: {
          updatedAt: new Date(),
        },
        create: {
          id: data.userId,
          name: 'Usuario Better Auth',
          email: `${data.userId}@better-auth.user`,
          emailVerified: false,
          role: 'USUARIO',
          updatedAt: new Date(),
        },
      });

      // Determinar las categorías del evento
      const categoriaIds: bigint[] = [];
      
      if (data.categorias && data.categorias.length > 0) {
        for (const categoria of data.categorias) {
          let categoriaId: bigint;
          
          if (categoria.id) {
            // Si tiene ID, buscar si existe en la BD
            const categoriaExistente = await prisma.categoriaevento.findUnique({
              where: { categoriaeventoid: categoria.id }
            });
            
            if (categoriaExistente) {
              categoriaId = BigInt(categoriaExistente.categoriaeventoid);
            } else {
              // Si no existe, crear nueva categoría con el nombre
              const nuevaCategoria = await prisma.categoriaevento.create({
                data: {
                  nombre: categoria.nombre || `Categoría ${categoria.id}`,
                  descripcion: null
                }
              });
              categoriaId = BigInt(nuevaCategoria.categoriaeventoid);
            }
          } else if (categoria.nombre) {
            // Si no tiene ID pero tiene nombre, buscar o crear la categoría
            const categoriaExistente = await prisma.categoriaevento.findFirst({
              where: { nombre: categoria.nombre }
            });
            
            if (categoriaExistente) {
              categoriaId = BigInt(categoriaExistente.categoriaeventoid);
            } else {
              // Crear nueva categoría
              const nuevaCategoria = await prisma.categoriaevento.create({
                data: {
                  nombre: categoria.nombre,
                  descripcion: null
                }
              });
              categoriaId = BigInt(nuevaCategoria.categoriaeventoid);
            }
          } else {
            // Si no tiene ni ID ni nombre, usar categoría por defecto
            categoriaId = await this.ensureDefaultCategory();
          }
          
          categoriaIds.push(categoriaId);
        }
      } else {
        // Si no hay categorías, usar categoría por defecto
        categoriaIds.push(await this.ensureDefaultCategory());
      }

      // Crear el evento
      const evento = await prisma.eventos.create({
        data: {
          eventoid: randomUUID(),
          titulo: data.titulo,
          descripcion: data.descripcion,
          ubicacion: data.ubicacion || '',
          mapa_evento: data.eventMap ?? {},
          creadorid: data.userId,
          evento_categorias: {
            create: categoriaIds.map(categoriaId => ({
              categoriaeventoid: categoriaId
            }))
          }
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

      // Crear fechas del evento
      if (data.fechas_evento && data.fechas_evento.length > 0) {
        const fechasData = data.fechas_evento.map((fecha) => ({
          fechaid: randomUUID(),
          eventoid: evento.eventoid,
          fecha_hora: fecha.fecha_hora,
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
            fecha_creacion: new Date(),
            fecha_limite: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año desde ahora
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

      // El estado se maneja directamente en el modelo eventos

      // get evento con sus imágenes y fechas
      const eventoCompleto = await prisma.eventos.findUnique({
        where: { eventoid: evento.eventoid },
        include: {
          imagenes_evento: true,
          fechas_evento: true,
          evento_categorias: {
            include: {
              categoriaevento: true,
            },
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

  static async updateEvent(
    id: string,
    userId: string,
    data: Partial<Omit<CreateEventData, 'userId'>>,
  ): Promise<EventWithImages> {
    try {
      const existing = await prisma.eventos.findUnique({ where: { eventoid: id } });
      if (!existing) throw new Error('Evento no encontrado');
      if (existing.creadorid !== userId) throw new Error('No autorizado');

      const updated = await prisma.eventos.update({
        where: { eventoid: id },
        data: {
          titulo: data.titulo ?? undefined,
          descripcion: data.descripcion ?? undefined,
          ubicacion: data.ubicacion ?? undefined,
          mapa_evento: data.eventMap ?? undefined,
        },
      });

      // Opcionales: actualizar imágenes principales sencillas (PORTADA + GALERIA)
      if (data.imageUrl || (data.galeria_imagenes && data.galeria_imagenes.length >= 0)) {
        // borrar existentes y recrear simples
        await prisma.imagenes_evento.deleteMany({ where: { eventoid: id } });

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
          await prisma.imagenes_evento.createMany({ data: images });
        }
      }

      // Opcional: actualizar fechas del evento (reemplazo simple)
      if (data.fechas_evento) {
        await prisma.fechas_evento.deleteMany({ where: { eventoid: id } });
        const fechasData = data.fechas_evento.map((f) => ({
          fechaid: randomUUID(),
          eventoid: id,
          fecha_hora: f.fecha_hora,
          fecha_fin: f.fecha_fin,
        }));
        if (fechasData.length > 0) await prisma.fechas_evento.createMany({ data: fechasData });
      }

      // Opcional: actualizar categorías/tickets (reemplazo simple)
      if (data.ticket_types) {
        await prisma.stock_entrada.deleteMany({ where: { eventoid: id } });
        if (data.ticket_types.length > 0) {
          await prisma.stock_entrada.createMany({
            data: data.ticket_types.map((t) => ({
              stockid: randomUUID(),
              eventoid: id,
              nombre: t.nombre,
              precio: BigInt(t.precio),
              cant_max: t.stock_total,
              fecha_creacion: new Date(),
              fecha_limite: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año desde ahora
            })),
          });
        }
      }

      const full = await prisma.eventos.findUnique({
        where: { eventoid: updated.eventoid },
        include: {
          imagenes_evento: true,
          fechas_evento: true,
          evento_categorias: {
            include: {
              categoriaevento: true,
            },
          },
        },
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

  static async softDeleteEvent(id: string, userId: string): Promise<void> {
    try {
      const existing = await prisma.eventos.findUnique({ where: { eventoid: id } });
      if (!existing) throw new Error('Evento no encontrado');
      if (existing.creadorid !== userId) throw new Error('No autorizado');

      // Borrado lógico: crear registro de estado CANCELADO
      await prisma.evento_estado.create({
        data: {
          stateventid: randomUUID(),
          eventoid: id,
          Estado: 'CANCELADO',
          usuarioid: userId,
        },
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
      const evento = await prisma.eventos.findUnique({
        where: { eventoid: id },
        include: {
          imagenes_evento: true,
          fechas_evento: true,
          stock_entrada: true,
          evento_categorias: {
            include: {
              categoriaevento: true,
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

      return evento as EventWithImages | null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error getting event:', error);
      throw new Error(
        `Error al obtener el evento: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  static async getUserEvents(userId: string): Promise<EventWithImages[]> {
    try {
      const eventos = await prisma.eventos.findMany({
        where: {
          creadorid: userId,
        },
        include: {
          imagenes_evento: true,
          fechas_evento: true,
          evento_categorias: {
            include: {
              categoriaevento: true,
            },
          },
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

  static async getAllPublicEvents(): Promise<EventWithImages[]> {
    try {
      const eventos = await prisma.eventos.findMany({
        include: {
          imagenes_evento: true,
          fechas_evento: true,
          evento_categorias: {
            include: {
              categoriaevento: true,
            },
          },
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

      // Filtrar eventos públicos basado en el estado
      const eventosPublicos = eventos.filter((evento) => {
        const estadoActual = evento.evento_estado?.[0]?.Estado;
        return (
          estadoActual === 'ACTIVO' || estadoActual === 'COMPLETADO'
        );
      });

      return eventosPublicos as EventWithImages[];
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error getting all public events:', error);
      throw new Error(
        `Error al obtener todos los eventos: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  static async getPublicEventVisibleById(id: string): Promise<EventWithImages | null> {
    const evento = await prisma.eventos.findFirst({
      where: {
        eventoid: id,
      },
      include: {
        imagenes_evento: true,
        fechas_evento: true,
        evento_categorias: {
          include: {
            categoriaevento: true,
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

    if (!evento) return null;

    // Verificar si el evento es público basado en el estado
    const estadoActual = evento.evento_estado?.[0]?.Estado;
    if (estadoActual === 'ACTIVO' || estadoActual === 'COMPLETADO') {
      return evento as EventWithImages;
    }

    return null;
  }

}
