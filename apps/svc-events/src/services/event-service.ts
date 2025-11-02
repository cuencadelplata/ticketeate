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
  fecha_publicacion?: string; // Fecha programada para publicar el evento
}

export interface EventWithImages {
  eventoid: string;
  titulo: string;
  descripcion?: string;
  ubicacion?: string;
  fecha_creacion?: Date;
  mapa_evento?: Record<string, unknown>;
  fecha_publicacion?: Date;
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
  evento_categorias?: Array<{
    categoriaeventoid: number;
    categoriaevento: {
      categoriaeventoid: number;
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
    precio: string; // Changed from bigint to string for JSON serialization
    cant_max: number;
    fecha_creacion: Date;
    fecha_limite: Date;
  }>;
}

export class EventService {
  // Método para asegurar que existe una categoría por defecto
  private static async ensureDefaultCategory(): Promise<bigint> {
    // Buscar si ya existe una categoría por defecto
    let categoriaDefault = await prisma.categoriaEvento.findFirst({
      where: { nombre: 'General' },
    });

    if (!categoriaDefault) {
      // Crear categoría por defecto
      categoriaDefault = await prisma.categoriaEvento.create({
        data: {
          nombre: 'General',
          descripcion: 'Categoría por defecto para eventos',
        },
      });
    }

    return BigInt(categoriaDefault.categoriaeventoid);
  }

  static async createEvent(data: CreateEventData): Promise<EventWithImages> {
    try {
      // Ensure user exists
      await this.ensureUserUpsert(data.userId);

      // Resolve categoria ids (or default)
      const categoriaIds = await this.resolveCategoryIds(data.categorias);

      // Create the base event
      const evento = await prisma.eventos.create({
        data: {
          eventoid: randomUUID(),
          titulo: data.titulo,
          descripcion: data.descripcion,
          ubicacion: data.ubicacion || '',
          mapa_evento: data.eventMap ?? {},
          fecha_publicacion: data.fecha_publicacion ? new Date(data.fecha_publicacion) : null,
          creadorid: data.userId,
          evento_categorias: {
            create: categoriaIds.map((categoriaId) => ({
              categoriaeventoid: Number(categoriaId),
            })),
          },
        },
      });

      // Create related resources
      await Promise.all([
        this.createImages(evento.eventoid, data),
        this.createDates(evento.eventoid, data),
        this.createTickets(evento.eventoid, data),
        this.createInitialStatsAndQueueAndState(evento.eventoid, data),
      ]);

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

  private static async ensureUserUpsert(userId: string): Promise<void> {
    await prisma.user.upsert({
      where: { id: userId },
      update: {
        updatedAt: new Date(),
      },
      create: {
        id: userId,
        name: 'Usuario Better Auth',
        email: `${userId}@better-auth.user`,
        emailVerified: false,
        role: 'USUARIO',
        updatedAt: new Date(),
      },
    });
  }

  private static async resolveCategoryIds(
    categorias?: Array<{ id?: number; nombre?: string }>,
  ): Promise<bigint[]> {
    const categoriaIds: bigint[] = [];

    if (!categorias || categorias.length === 0) {
      categoriaIds.push(await this.ensureDefaultCategory());
      return categoriaIds;
    }

    for (const categoria of categorias) {
      let categoriaId: bigint;

      if (categoria.id) {
        const categoriaExistente = await prisma.categoriaEvento.findUnique({
          where: { categoriaeventoid: categoria.id },
        });

        if (categoriaExistente) {
          categoriaId = BigInt(categoriaExistente.categoriaeventoid);
        } else {
          const nuevaCategoria = await prisma.categoriaEvento.create({
            data: {
              nombre: categoria.nombre || `Categoría ${categoria.id}`,
              descripcion: null,
            },
          });
          categoriaId = BigInt(nuevaCategoria.categoriaeventoid);
        }
      } else if (categoria.nombre) {
        const categoriaExistente = await prisma.categoriaEvento.findFirst({
          where: { nombre: categoria.nombre },
        });

        if (categoriaExistente) {
          categoriaId = BigInt(categoriaExistente.categoriaeventoid);
        } else {
          const nuevaCategoria = await prisma.categoriaEvento.create({
            data: {
              nombre: categoria.nombre,
              descripcion: null,
            },
          });
          categoriaId = BigInt(nuevaCategoria.categoriaeventoid);
        }
      } else {
        categoriaId = await this.ensureDefaultCategory();
      }

      categoriaIds.push(categoriaId);
    }

    return categoriaIds;
  }

  private static async createImages(eventoid: string, data: CreateEventData): Promise<void> {
    const imagenesData: Array<{ imagenid: string; eventoid: string; url: string; tipo: string }> = [];

    if (data.imageUrl) {
      imagenesData.push({
        imagenid: randomUUID(),
        eventoid,
        url: data.imageUrl,
        tipo: 'PORTADA',
      });
    }

    if (data.galeria_imagenes && data.galeria_imagenes.length > 0) {
      for (const url of data.galeria_imagenes) {
        imagenesData.push({
          imagenid: randomUUID(),
          eventoid,
          url,
          tipo: 'GALERIA',
        });
      }
    }

    if (imagenesData.length > 0) {
      await prisma.imagenes_evento.createMany({ data: imagenesData });
    }
  }

  private static async createDates(eventoid: string, data: CreateEventData): Promise<void> {
    if (!data.fechas_evento || data.fechas_evento.length === 0) return;
    const fechasData = data.fechas_evento.map((fecha) => ({
      fechaid: randomUUID(),
      eventoid,
      fecha_hora: fecha.fecha_hora,
      fecha_fin: fecha.fecha_fin,
    }));
    if (fechasData.length > 0) {
      await prisma.fechas_evento.createMany({ data: fechasData });
    }
  }

  private static async createTickets(eventoid: string, data: CreateEventData): Promise<void> {
    if (!data.ticket_types || data.ticket_types.length === 0) return;
    await prisma.stock_entrada.createMany({
      data: data.ticket_types.map((t) => ({
        stockid: randomUUID(),
        eventoid,
        nombre: t.nombre,
        precio: BigInt(t.precio),
        cant_max: t.stock_total,
        fecha_creacion: new Date(),
        fecha_limite: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      })),
    });
  }

  private static async createInitialStatsAndQueueAndState(eventoid: string, data: CreateEventData): Promise<void> {
    await prisma.estadisticas.create({
      data: {
        estadisticaid: randomUUID(),
        eventoid,
        total_vendidos: 0,
        total_cancelados: 0,
        total_ingresos: 0,
      },
    });

    await prisma.colas_evento.create({
      data: {
        colaid: randomUUID(),
        eventoid,
        max_concurrentes: 10,
        max_usuarios: 100,
      },
    });

    await prisma.evento_estado.create({
      data: {
        stateventid: randomUUID(),
        eventoid,
        Estado: data.estado || 'OCULTO',
        usuarioid: data.userId,
      },
    });
  }

  static async updateEvent(
    id: string,
    userId: string,
    data: Partial<Omit<CreateEventData, 'userId'>>,
  ): Promise<EventWithImages> {
    try {
      const existing = await this.getExistingEvent(id);
      if (!existing) throw new Error('Evento no encontrado');
      if (existing.creadorid !== userId) throw new Error('No autorizado');

      // Detectar cambios en los campos principales para trazabilidad
      const changes = this.detectChanges(existing, data);

      const updated = await prisma.eventos.update({
        where: { eventoid: id },
        data: {
          titulo: data.titulo ?? undefined,
          descripcion: data.descripcion ?? undefined,
          ubicacion: data.ubicacion ?? undefined,
          mapa_evento: data.eventMap ?? undefined,
        },
      });

      // Crear registros de trazabilidad y estado si aplica
      if (changes.length > 0) {
        await this.createModifications(changes, id, userId);
      }

      if (data.estado && data.estado !== existing.evento_estado?.[0]?.Estado) {
        await prisma.evento_estado.create({
          data: {
            stateventid: randomUUID(),
            eventoid: id,
            Estado: data.estado,
            usuarioid: userId,
          },
        });
      }

      // Delegar actualizaciones opcionales a helpers para reducir complejidad
      await this.handleImages(id, data);
      await this.handleDates(id, data);
      await this.handleTickets(id, data);

      const full = await prisma.eventos.findUnique({
        where: { eventoid: updated.eventoid },
        include: {
          imagenes_evento: true,
          fechas_evento: true,
          stock_entrada: true,
          evento_categorias: {
            include: {
              categoriaevento: true,
            },
          },
        },
      });
      if (!full) throw new Error('Error al recuperar el evento actualizado');

      // Convertir BigInt a string para evitar errores de serialización JSON
      const eventoSerializado = {
        ...full,
        stock_entrada: full.stock_entrada?.map((stock) => ({
          ...stock,
          precio: stock.precio.toString(),
        })),
      };

      return eventoSerializado as EventWithImages;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating event:', error);
      throw new Error(
        `Error al actualizar el evento: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private static async getExistingEvent(id: string) {
    return prisma.eventos.findUnique({
      where: { eventoid: id },
      include: {
        evento_estado: {
          orderBy: { fecha_de_cambio: 'desc' },
          take: 1,
        },
      },
    });
  }

  private static detectChanges(
    existing: {
      titulo?: string | null;
      descripcion?: string | null;
      ubicacion?: string | null;
      mapa_evento?: Record<string, unknown> | null;
    },
    data: Partial<Omit<CreateEventData, 'userId'>>,
  ): Array<{ campo_modificado: string; valor_anterior: string | null; valor_nuevo: string | null }> {
    const changes: Array<{ campo_modificado: string; valor_anterior: string | null; valor_nuevo: string | null }> =
      [];

    if (data.titulo && data.titulo !== existing.titulo) {
      changes.push({
        campo_modificado: 'titulo',
        valor_anterior: existing.titulo,
        valor_nuevo: data.titulo,
      });
    }

    if (data.descripcion && data.descripcion !== existing.descripcion) {
      changes.push({
        campo_modificado: 'descripcion',
        valor_anterior: existing.descripcion,
        valor_nuevo: data.descripcion,
      });
    }

    if (data.ubicacion && data.ubicacion !== existing.ubicacion) {
      changes.push({
        campo_modificado: 'ubicacion',
        valor_anterior: existing.ubicacion,
        valor_nuevo: data.ubicacion,
      });
    }

    if (data.eventMap && JSON.stringify(data.eventMap) !== JSON.stringify(existing.mapa_evento)) {
      changes.push({
        campo_modificado: 'mapa_evento',
        valor_anterior: JSON.stringify(existing.mapa_evento),
        valor_nuevo: JSON.stringify(data.eventMap),
      });
    }

    return changes;
  }

  private static async createModifications(
    changes: Array<{ campo_modificado: string; valor_anterior: string | null; valor_nuevo: string | null }>,
    eventoid: string,
    userId: string,
  ) {
    await Promise.all(
      changes.map((change) =>
        prisma.evento_modificaciones.create({
          data: {
            modificacionid: randomUUID(),
            eventoid,
            campo_modificado: change.campo_modificado,
            valor_anterior: change.valor_anterior,
            valor_nuevo: change.valor_nuevo,
            usuarioid: userId,
          },
        }),
      ),
    );
  }

  private static async handleImages(
    id: string,
    data: Partial<Omit<CreateEventData, 'userId'>>,
  ): Promise<void> {
    if (!data.imageUrl && !data.galeria_imagenes) return;

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

  private static async handleDates(id: string, data: Partial<Omit<CreateEventData, 'userId'>>): Promise<void> {
    if (!data.fechas_evento) return;

    await prisma.fechas_evento.deleteMany({ where: { eventoid: id } });
    const fechasData = data.fechas_evento.map((f) => ({
      fechaid: randomUUID(),
      eventoid: id,
      fecha_hora: f.fecha_hora,
      fecha_fin: f.fecha_fin,
    }));
    if (fechasData.length > 0) await prisma.fechas_evento.createMany({ data: fechasData });
  }

  private static async handleTickets(id: string, data: Partial<Omit<CreateEventData, 'userId'>>): Promise<void> {
    if (!data.ticket_types) return;

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

  static async softDeleteEvent(id: string, userId: string): Promise<void> {
    try {
      const existing = await prisma.eventos.findUnique({ where: { eventoid: id } });
      if (!existing) throw new Error('Evento no encontrado');
      if (existing.creadorid !== userId) throw new Error('No autorizado');

      // Borrado lógico: crear registro de estado OCULTO
      await prisma.evento_estado.create({
        data: {
          stateventid: randomUUID(),
          eventoid: id,
          Estado: 'OCULTO',
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

      if (!evento) return null;

      // Convertir BigInt a string para evitar errores de serialización JSON
      const eventoSerializado = {
        ...evento,
        stock_entrada: evento.stock_entrada?.map((stock) => ({
          ...stock,
          precio: stock.precio.toString(),
        })),
      };

      return eventoSerializado as EventWithImages;
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
        orderBy: {
          fecha_creacion: 'desc',
        },
      });

      // Convertir BigInt a string para evitar errores de serialización JSON
      const eventosSerializados = eventos.map((evento) => ({
        ...evento,
        stock_entrada: evento.stock_entrada?.map((stock) => ({
          ...stock,
          precio: stock.precio.toString(),
        })),
      }));

      return eventosSerializados as EventWithImages[];
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
        orderBy: {
          fecha_creacion: 'desc',
        },
      });

      // Filtrar eventos públicos basado en el estado
      const eventosPublicos = eventos.filter((evento) => {
        const estadoActual = evento.evento_estado?.[0]?.Estado;
        return estadoActual === 'ACTIVO' || estadoActual === 'COMPLETADO';
      });

      // Convertir BigInt a string para evitar errores de serialización JSON
      const eventosSerializados = eventosPublicos.map((evento) => ({
        ...evento,
        stock_entrada: evento.stock_entrada?.map((stock) => ({
          ...stock,
          precio: stock.precio.toString(),
        })),
      }));

      return eventosSerializados as EventWithImages[];
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

    if (!evento) return null;

    // Verificar si el evento es público basado en el estado
    const estadoActual = evento.evento_estado?.[0]?.Estado;
    if (estadoActual === 'ACTIVO' || estadoActual === 'COMPLETADO') {
      // Convertir BigInt a string para evitar errores de serialización JSON
      const eventoSerializado = {
        ...evento,
        stock_entrada: evento.stock_entrada?.map((stock) => ({
          ...stock,
          precio: stock.precio.toString(),
        })),
      };
      return eventoSerializado as EventWithImages;
    }

    return null;
  }

  static async publishScheduledEvents(): Promise<{ published: number; errors: number }> {
    try {
      const now = new Date();

      // Buscar eventos que están programados para publicarse y aún están ocultos
      const scheduledEvents = await prisma.eventos.findMany({
        where: {
          fecha_publicacion: {
            lte: now, // fecha_publicacion <= ahora
          },
          evento_estado: {
            some: {
              Estado: 'OCULTO',
              fecha_de_cambio: {
                // Solo el estado más reciente
              },
            },
          },
        },
        include: {
          evento_estado: {
            orderBy: {
              fecha_de_cambio: 'desc',
            },
            take: 1,
          },
        },
      });

      let published = 0;
      let errors = 0;

      for (const evento of scheduledEvents) {
        try {
          // Verificar que el estado actual es realmente OCULTO
          const currentState = evento.evento_estado?.[0]?.Estado;
          if (currentState !== 'OCULTO') {
            continue;
          }

          // Crear nuevo estado ACTIVO
          await prisma.evento_estado.create({
            data: {
              stateventid: randomUUID(),
              eventoid: evento.eventoid,
              Estado: 'ACTIVO',
              usuarioid: evento.creadorid,
            },
          });

          published++;
          // eslint-disable-next-line no-console
          console.log(`Published scheduled event: ${evento.titulo} (${evento.eventoid})`);
        } catch (error) {
          errors++;
          // eslint-disable-next-line no-console
          console.error(`Error publishing event ${evento.eventoid}:`, error);
        }
      }

      return { published, errors };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error in publishScheduledEvents:', error);
      throw new Error(
        `Error al publicar eventos programados: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
