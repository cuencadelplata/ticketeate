import { prisma } from '@/lib/prisma';

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

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        tickets: true,
        ticketOptions: true,
        _count: {
          select: {
            tickets: true,
          },
        },
      },
    });

    if (!event) {
      return null;
    }

    return {
      id: event.id,
      titulo: event.name,
      descripcion: event.description || undefined,
      fecha: event.startDate,
      ubicacion: event.location || undefined,
      capacidad: event.capacity || undefined,
      acceso: event.access as 'PUBLIC' | 'PRIVATE',
      tipoPrecio: event.pricingType as 'FREE' | 'PAID',
      imagen: event.imageUrl || undefined,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      productorId: event.producerId,
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
    const events = await prisma.event.findMany({
      where: { producerId: productorId },
      orderBy: { startDate: 'asc' },
      include: {
        tickets: true,
        ticketOptions: true,
        _count: {
          select: {
            tickets: true,
          },
        },
      },
    });

    return events.map((event: any) => ({
      id: event.id,
      titulo: event.name,
      descripcion: event.description || undefined,
      fecha: event.startDate,
      ubicacion: event.location || undefined,
      capacidad: event.capacity || undefined,
      acceso: event.access as 'PUBLIC' | 'PRIVATE',
      tipoPrecio: event.pricingType as 'FREE' | 'PAID',
      imagen: event.imageUrl || undefined,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      productorId: event.producerId,
    }));
  } catch (error) {
    console.error('Error fetching eventos by productor:', error);
    return [];
  }
}
