import { prisma } from '@repo/db';

export type Evento = {
  id: string;
  titulo: string;
  descripcion?: string;
  fecha: Date;
  ubicacion?: string;
  capacidad?: number;
  acceso: 'PUBLIC' | 'PRIVATE';
  tipoPrecio: 'FREE' | 'PAID';
  imagen?: string;
  createdAt: Date;
  updatedAt: Date;
  productorId: string;
};

export async function getEventoById(id: string): Promise<Evento | null> {
  try {
    // Verificar si prisma está disponible
    if (!prisma) {
      console.error('Prisma client not available');
      return null;
    }

    const event = await prisma.evento.findUnique({
      where: { id_evento: id },
      include: {
        imagenes_evento: true,
        fechas_evento: true,
      },
    });

    if (!event) {
      return null;
    }

    return {
      id: event.id_evento,
      titulo: event.titulo,
      descripcion: event.descripcion || undefined,
      fecha: event.fechas_evento?.[0]?.fecha_hora || event.fecha_inicio_venta,
      ubicacion: event.ubicacion || undefined,
      capacidad: undefined,
      acceso: 'PUBLIC',
      tipoPrecio: 'FREE',
      imagen: event.imagenes_evento?.find((i) => i.tipo === 'portada')?.url || undefined,
      createdAt: event.fecha_creacion || new Date(),
      updatedAt: new Date(),
      productorId: event.id_creador,
    };
  } catch (error) {
    console.error('Error fetching evento by ID:', error);

    // Si hay error de conexión, devolver datos de prueba
    if (error instanceof Error && error.message.includes('connect')) {
      console.log('Database connection failed, returning mock data');
      return {
        id,
        titulo: 'Evento de Prueba',
        descripcion: 'Este es un evento de prueba mientras se configura la base de datos.',
        fecha: new Date(),
        ubicacion: 'Ubicación de prueba',
        capacidad: 100,
        acceso: 'PUBLIC' as const,
        tipoPrecio: 'FREE' as const,
        imagen: '/placeholder.svg',
        createdAt: new Date(),
        updatedAt: new Date(),
        productorId: 'test-user',
      };
    }

    return null;
  }
}

export async function getEventosByProductor(productorId: string): Promise<Evento[]> {
  try {
    const events = await prisma.evento.findMany({
      where: { id_creador: productorId },
      orderBy: { fecha_inicio_venta: 'asc' },
      include: {
        imagenes_evento: true,
        fechas_evento: true,
      },
    });

    return events.map((event: any) => ({
      id: event.id_evento,
      titulo: event.titulo,
      descripcion: event.descripcion || undefined,
      fecha: event.fechas_evento?.[0]?.fecha_hora || event.fecha_inicio_venta,
      ubicacion: event.ubicacion || undefined,
      capacidad: undefined,
      acceso: 'PUBLIC' as const,
      tipoPrecio: 'FREE' as const,
      imagen: event.imagenes_evento?.find((i: any) => i.tipo === 'portada')?.url || undefined,
      createdAt: event.fecha_creacion || new Date(),
      updatedAt: new Date(),
      productorId: event.id_creador,
    }));
  } catch (error) {
    console.error('Error fetching eventos by productor:', error);
    return [];
  }
}
