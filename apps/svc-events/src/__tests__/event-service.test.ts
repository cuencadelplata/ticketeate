import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventService, CreateEventData } from '../services/event-service';

// Mock Prisma
vi.mock('@repo/db', () => ({
  prisma: {
    user: {
      upsert: vi.fn(),
    },
    categoriaevento: {
      findFirst: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    eventos: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    imagenes_evento: {
      createMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    fechas_evento: {
      createMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    stock_entrada: {
      createMany: vi.fn(),
      deleteMany: vi.fn(),
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
    evento_modificaciones: {
      create: vi.fn(),
    },
  },
}));

// Mock crypto
vi.mock('node:crypto', () => ({
  randomUUID: vi.fn(() => 'mock-uuid'),
}));

describe('EventService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createEvent', () => {
    it('should create an event with minimal data', async () => {
      const mockPrisma = await import('@repo/db');

      const mockEventData: CreateEventData = {
        titulo: 'Test Event',
        fechas_evento: [{ fecha_hora: new Date('2024-12-31T20:00:00Z') }],
        userId: 'user-123',
      };

      // Mock database responses
      vi.mocked(mockPrisma.prisma.user.upsert).mockResolvedValue({
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: false,
        role: 'USUARIO',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(mockPrisma.prisma.categoriaevento.findFirst).mockResolvedValue({
        categoriaeventoid: 1,
        nombre: 'General',
        descripcion: 'Categoría por defecto',
      });

      vi.mocked(mockPrisma.prisma.eventos.create).mockResolvedValue({
        eventoid: 'event-123',
        titulo: 'Test Event',
        descripcion: null,
        ubicacion: '',
        mapa_evento: {},
        fecha_publicacion: null,
        creadorid: 'user-123',
        fecha_creacion: new Date(),
      });

      vi.mocked(mockPrisma.prisma.imagenes_evento.createMany).mockResolvedValue({ count: 0 });
      vi.mocked(mockPrisma.prisma.fechas_evento.createMany).mockResolvedValue({ count: 1 });
      vi.mocked(mockPrisma.prisma.stock_entrada.createMany).mockResolvedValue({ count: 0 });
      vi.mocked(mockPrisma.prisma.estadisticas.create).mockResolvedValue({
        estadisticaid: 'stats-123',
        eventoid: 'event-123',
        total_vendidos: 0,
        total_cancelados: 0,
        total_ingresos: 0,
      });
      vi.mocked(mockPrisma.prisma.colas_evento.create).mockResolvedValue({
        colaid: 'queue-123',
        eventoid: 'event-123',
        max_concurrentes: 10,
        max_usuarios: 100,
      });
      vi.mocked(mockPrisma.prisma.evento_estado.create).mockResolvedValue({
        stateventid: 'state-123',
        eventoid: 'event-123',
        Estado: 'OCULTO',
        usuarioid: 'user-123',
        fecha_de_cambio: new Date(),
      });

      vi.mocked(mockPrisma.prisma.eventos.findUnique).mockResolvedValue({
        eventoid: 'event-123',
        titulo: 'Test Event',
        descripcion: null,
        ubicacion: '',
        mapa_evento: {},
        fecha_publicacion: null,
        creadorid: 'user-123',
        fecha_creacion: new Date(),
        imagenes_evento: [],
        fechas_evento: [],
        evento_categorias: [],
      });

      const result = await EventService.createEvent(mockEventData);

      expect(result).toBeDefined();
      expect(result.titulo).toBe('Test Event');
      expect(mockPrisma.prisma.user.upsert).toHaveBeenCalled();
      expect(mockPrisma.prisma.eventos.create).toHaveBeenCalled();
    });

    it('should handle errors during event creation', async () => {
      const mockPrisma = await import('@repo/db');

      const mockEventData: CreateEventData = {
        titulo: 'Test Event',
        fechas_evento: [{ fecha_hora: new Date('2024-12-31T20:00:00Z') }],
        userId: 'user-123',
      };

      vi.mocked(mockPrisma.prisma.user.upsert).mockRejectedValue(new Error('Database error'));

      await expect(EventService.createEvent(mockEventData)).rejects.toThrow(
        'Error al crear el evento',
      );
    });
  });

  describe('getEventById', () => {
    it('should return event when found', async () => {
      const mockPrisma = await import('@repo/db');

      const mockEvent = {
        eventoid: 'event-123',
        titulo: 'Test Event',
        descripcion: null,
        ubicacion: '',
        mapa_evento: {},
        fecha_publicacion: null,
        creadorid: 'user-123',
        fecha_creacion: new Date(),
        imagenes_evento: [],
        fechas_evento: [],
        stock_entrada: [],
        evento_categorias: [],
        evento_estado: [],
      };

      vi.mocked(mockPrisma.prisma.eventos.findUnique).mockResolvedValue(mockEvent);

      const result = await EventService.getEventById('event-123');

      expect(result).toBeDefined();
      expect(result?.titulo).toBe('Test Event');
    });

    it('should return null when event not found', async () => {
      const mockPrisma = await import('@repo/db');

      vi.mocked(mockPrisma.prisma.eventos.findUnique).mockResolvedValue(null);

      const result = await EventService.getEventById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getUserEvents', () => {
    it('should return user events', async () => {
      const mockPrisma = await import('@repo/db');

      const mockEvents = [
        {
          eventoid: 'event-1',
          titulo: 'Event 1',
          descripcion: null,
          ubicacion: '',
          mapa_evento: {},
          fecha_publicacion: null,
          creadorid: 'user-123',
          fecha_creacion: new Date(),
          imagenes_evento: [],
          fechas_evento: [],
          stock_entrada: [],
          evento_categorias: [],
          evento_estado: [],
        },
      ];

      vi.mocked(mockPrisma.prisma.eventos.findMany).mockResolvedValue(mockEvents);

      const result = await EventService.getUserEvents('user-123');

      expect(result).toHaveLength(1);
      expect(result[0].titulo).toBe('Event 1');
    });
  });

  describe('getAllPublicEvents', () => {
    it('should return only public events', async () => {
      const mockPrisma = await import('@repo/db');

      const mockEvents = [
        {
          eventoid: 'event-1',
          titulo: 'Public Event',
          descripcion: null,
          ubicacion: '',
          mapa_evento: {},
          fecha_publicacion: null,
          creadorid: 'user-123',
          fecha_creacion: new Date(),
          imagenes_evento: [],
          fechas_evento: [],
          stock_entrada: [],
          evento_categorias: [],
          evento_estado: [{ Estado: 'ACTIVO', fecha_de_cambio: new Date() }],
        },
        {
          eventoid: 'event-2',
          titulo: 'Hidden Event',
          descripcion: null,
          ubicacion: '',
          mapa_evento: {},
          fecha_publicacion: null,
          creadorid: 'user-123',
          fecha_creacion: new Date(),
          imagenes_evento: [],
          fechas_evento: [],
          stock_entrada: [],
          evento_categorias: [],
          evento_estado: [{ Estado: 'OCULTO', fecha_de_cambio: new Date() }],
        },
      ];

      vi.mocked(mockPrisma.prisma.eventos.findMany).mockResolvedValue(mockEvents);

      const result = await EventService.getAllPublicEvents();

      expect(result).toHaveLength(1);
      expect(result[0].titulo).toBe('Public Event');
    });
  });

  describe('softDeleteEvent', () => {
    it('should soft delete an event', async () => {
      const mockPrisma = await import('@repo/db');

      const mockEvent = {
        eventoid: 'event-123',
        titulo: 'Test Event',
        creadorid: 'user-123',
      };

      vi.mocked(mockPrisma.prisma.eventos.findUnique).mockResolvedValue(mockEvent);
      vi.mocked(mockPrisma.prisma.evento_estado.create).mockResolvedValue({
        stateventid: 'state-123',
        eventoid: 'event-123',
        Estado: 'OCULTO',
        usuarioid: 'user-123',
        fecha_de_cambio: new Date(),
      });

      await EventService.softDeleteEvent('event-123', 'user-123');

      expect(mockPrisma.prisma.evento_estado.create).toHaveBeenCalledWith({
        data: {
          stateventid: 'mock-uuid',
          eventoid: 'event-123',
          Estado: 'OCULTO',
          usuarioid: 'user-123',
        },
      });
    });

    it('should throw error when event not found', async () => {
      const mockPrisma = await import('@repo/db');

      vi.mocked(mockPrisma.prisma.eventos.findUnique).mockResolvedValue(null);

      await expect(EventService.softDeleteEvent('non-existent', 'user-123')).rejects.toThrow(
        'Evento no encontrado',
      );
    });

    it('should throw error when user not authorized', async () => {
      const mockPrisma = await import('@repo/db');

      const mockEvent = {
        eventoid: 'event-123',
        titulo: 'Test Event',
        creadorid: 'other-user',
      };

      vi.mocked(mockPrisma.prisma.eventos.findUnique).mockResolvedValue(mockEvent);

      await expect(EventService.softDeleteEvent('event-123', 'user-123')).rejects.toThrow(
        'No autorizado',
      );
    });
  });

  describe('publishScheduledEvents', () => {
    it('should publish scheduled events', async () => {
      const mockPrisma = await import('@repo/db');

      const mockScheduledEvents = [
        {
          eventoid: 'event-1',
          titulo: 'Scheduled Event',
          creadorid: 'user-123',
          fecha_publicacion: new Date('2023-01-01'),
          evento_estado: [{ Estado: 'OCULTO', fecha_de_cambio: new Date() }],
        },
      ];

      vi.mocked(mockPrisma.prisma.eventos.findMany).mockResolvedValue(mockScheduledEvents);
      vi.mocked(mockPrisma.prisma.evento_estado.create).mockResolvedValue({
        stateventid: 'state-123',
        eventoid: 'event-1',
        Estado: 'ACTIVO',
        usuarioid: 'user-123',
        fecha_de_cambio: new Date(),
      });

      const result = await EventService.publishScheduledEvents();

      expect(result.published).toBe(1);
      expect(result.errors).toBe(0);
    });
  });
});

