import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock de Prisma antes de importar
const mockPrisma = {
  user: {
    upsert: vi.fn(),
  },
  eventos: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
  },
  imagenes_evento: {
    createMany: vi.fn(),
  },
  fechas_evento: {
    createMany: vi.fn(),
  },
  estadisticas: {
    create: vi.fn(),
  },
  colas_evento: {
    create: vi.fn(),
  },
  evento_estado: {
    create: vi.fn(),
  },
};

vi.mock('@repo/db', () => ({
  prisma: mockPrisma,
}));

// Mock de crypto
vi.mock('node:crypto', () => ({
  randomUUID: vi.fn(() => 'mock-uuid'),
}));

import { EventService, CreateEventData } from '../services/event-service';

describe('EventService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createEvent', () => {
    it('should create event successfully with minimal data', async () => {
      const mockEvent = {
        eventoid: 'mock-uuid',
        titulo: 'Test Event',
        descripcion: null,
        ubicacion: '',
        mapa_evento: {},
        creadorid: 'user-123',
      };

      const mockCompleteEvent = {
        ...mockEvent,
        imagenes_evento: [],
        fechas_evento: [],
        evento_estado: [],
      };

      mockPrisma.user.upsert.mockResolvedValue({});
      mockPrisma.eventos.create.mockResolvedValue(mockEvent);
      mockPrisma.imagenes_evento.createMany.mockResolvedValue({});
      mockPrisma.fechas_evento.createMany.mockResolvedValue({});
      mockPrisma.estadisticas.create.mockResolvedValue({});
      mockPrisma.colas_evento.create.mockResolvedValue({});
      mockPrisma.evento_estado.create.mockResolvedValue({});
      mockPrisma.eventos.findUnique.mockResolvedValue(mockCompleteEvent);

      const eventData: CreateEventData = {
        titulo: 'Test Event',
        fecha_inicio_venta: new Date('2024-12-01'),
        fecha_fin_venta: new Date('2024-12-31'),
        clerkUserId: 'user-123',
      };

      const result = await EventService.createEvent(eventData);

      expect(result).toEqual(mockCompleteEvent);
      expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        update: {},
        create: {
          id: 'user-123',
          name: 'Usuario Clerk',
          email: 'user-123@clerk.user',
          emailVerified: false,
          updatedAt: expect.any(Date),
        },
      });
      expect(mockPrisma.eventos.create).toHaveBeenCalledWith({
        data: {
          eventoid: 'mock-uuid',
          titulo: 'Test Event',
          descripcion: undefined,
          ubicacion: '',
          mapa_evento: {},
          creadorid: 'user-123',
        },
      });
    });

    it('should create event with all optional data', async () => {
      const mockEvent = {
        eventoid: 'mock-uuid',
        titulo: 'Test Event',
        descripcion: 'Test Description',
        ubicacion: 'Test Location',
        mapa_evento: { sectors: [] },
        creadorid: 'user-123',
      };

      const mockCompleteEvent = {
        ...mockEvent,
        imagenes_evento: [
          { imagenid: 'img-1', url: 'https://example.com/cover.jpg', tipo: 'PORTADA' },
          { imagenid: 'img-2', url: 'https://example.com/gallery1.jpg', tipo: 'GALERIA' },
        ],
        fechas_evento: [
          {
            fechaid: 'date-1',
            fecha_hora: new Date('2024-12-01'),
            fecha_fin: new Date('2024-12-01'),
          },
        ],
        evento_estado: [],
      };

      mockPrisma.user.upsert.mockResolvedValue({});
      mockPrisma.eventos.create.mockResolvedValue(mockEvent);
      mockPrisma.imagenes_evento.createMany.mockResolvedValue({});
      mockPrisma.fechas_evento.createMany.mockResolvedValue({});
      mockPrisma.estadisticas.create.mockResolvedValue({});
      mockPrisma.colas_evento.create.mockResolvedValue({});
      mockPrisma.evento_estado.create.mockResolvedValue({});
      mockPrisma.eventos.findUnique.mockResolvedValue(mockCompleteEvent);

      const eventData: CreateEventData = {
        titulo: 'Test Event',
        descripcion: 'Test Description',
        ubicacion: 'Test Location',
        fecha_inicio_venta: new Date('2024-12-01'),
        fecha_fin_venta: new Date('2024-12-31'),
        estado: 'ACTIVO',
        imageUrl: 'https://example.com/cover.jpg',
        galeria_imagenes: ['https://example.com/gallery1.jpg'],
        fechas_adicionales: [
          {
            fecha_inicio: new Date('2024-12-01'),
            fecha_fin: new Date('2024-12-01'),
          },
        ],
        eventMap: { sectors: [] },
        clerkUserId: 'user-123',
      };

      const result = await EventService.createEvent(eventData);

      expect(result).toEqual(mockCompleteEvent);
      expect(mockPrisma.imagenes_evento.createMany).toHaveBeenCalledWith({
        data: [
          {
            imagenid: 'mock-uuid',
            eventoid: 'mock-uuid',
            url: 'https://example.com/cover.jpg',
            tipo: 'PORTADA',
          },
          {
            imagenid: 'mock-uuid',
            eventoid: 'mock-uuid',
            url: 'https://example.com/gallery1.jpg',
            tipo: 'GALERIA',
          },
        ],
      });
      expect(mockPrisma.fechas_evento.createMany).toHaveBeenCalledWith({
        data: [
          {
            fechaid: 'mock-uuid',
            eventoid: 'mock-uuid',
            fecha_hora: new Date('2024-12-01'),
            fecha_fin: new Date('2024-12-01'),
          },
        ],
      });
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      mockPrisma.user.upsert.mockRejectedValue(dbError);

      const eventData: CreateEventData = {
        titulo: 'Test Event',
        fecha_inicio_venta: new Date('2024-12-01'),
        fecha_fin_venta: new Date('2024-12-31'),
        clerkUserId: 'user-123',
      };

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(EventService.createEvent(eventData)).rejects.toThrow(
        'Error al crear el evento: Database connection failed',
      );

      expect(consoleSpy).toHaveBeenCalledWith('Error creating event:', dbError);
      consoleSpy.mockRestore();
    });

    it('should handle case when created event cannot be retrieved', async () => {
      mockPrisma.user.upsert.mockResolvedValue({});
      mockPrisma.eventos.create.mockResolvedValue({ eventoid: 'mock-uuid' });
      mockPrisma.imagenes_evento.createMany.mockResolvedValue({});
      mockPrisma.fechas_evento.createMany.mockResolvedValue({});
      mockPrisma.estadisticas.create.mockResolvedValue({});
      mockPrisma.colas_evento.create.mockResolvedValue({});
      mockPrisma.evento_estado.create.mockResolvedValue({});
      mockPrisma.eventos.findUnique.mockResolvedValue(null);

      const eventData: CreateEventData = {
        titulo: 'Test Event',
        fecha_inicio_venta: new Date('2024-12-01'),
        fecha_fin_venta: new Date('2024-12-31'),
        clerkUserId: 'user-123',
      };

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(EventService.createEvent(eventData)).rejects.toThrow(
        'Error al crear el evento: Error al recuperar el evento creado',
      );

      consoleSpy.mockRestore();
    });
  });

  describe('getEventById', () => {
    it('should return event when found', async () => {
      const mockEvent = {
        eventoid: 'event-123',
        titulo: 'Test Event',
        imagenes_evento: [],
        fechas_evento: [],
      };

      mockPrisma.eventos.findUnique.mockResolvedValue(mockEvent);

      const result = await EventService.getEventById('event-123');

      expect(result).toEqual(mockEvent);
      expect(mockPrisma.eventos.findUnique).toHaveBeenCalledWith({
        where: { eventoid: 'event-123' },
        include: {
          imagenes_evento: true,
          fechas_evento: true,
        },
      });
    });

    it('should return null when event not found', async () => {
      mockPrisma.eventos.findUnique.mockResolvedValue(null);

      const result = await EventService.getEventById('non-existent');

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database error');
      mockPrisma.eventos.findUnique.mockRejectedValue(dbError);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(EventService.getEventById('event-123')).rejects.toThrow(
        'Error al obtener el evento: Database error',
      );

      expect(consoleSpy).toHaveBeenCalledWith('Error getting event:', dbError);
      consoleSpy.mockRestore();
    });
  });

  describe('getUserEvents', () => {
    it('should return user events', async () => {
      const mockEvents = [
        {
          eventoid: 'event-1',
          titulo: 'Event 1',
          imagenes_evento: [],
          fechas_evento: [],
        },
        {
          eventoid: 'event-2',
          titulo: 'Event 2',
          imagenes_evento: [],
          fechas_evento: [],
        },
      ];

      mockPrisma.eventos.findMany.mockResolvedValue(mockEvents);

      const result = await EventService.getUserEvents('user-123');

      expect(result).toEqual(mockEvents);
      expect(mockPrisma.eventos.findMany).toHaveBeenCalledWith({
        where: {
          creadorid: 'user-123',
        },
        include: {
          imagenes_evento: true,
          fechas_evento: true,
        },
        orderBy: {
          fecha_creacion: 'desc',
        },
      });
    });

    it('should return empty array when no events found', async () => {
      mockPrisma.eventos.findMany.mockResolvedValue([]);

      const result = await EventService.getUserEvents('user-123');

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database error');
      mockPrisma.eventos.findMany.mockRejectedValue(dbError);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(EventService.getUserEvents('user-123')).rejects.toThrow(
        'Error al obtener los eventos del usuario: Database error',
      );

      expect(consoleSpy).toHaveBeenCalledWith('Error getting user events:', dbError);
      consoleSpy.mockRestore();
    });
  });
});
