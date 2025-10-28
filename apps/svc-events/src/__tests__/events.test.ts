import { describe, it, expect, beforeEach, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { events } from '../routes/events';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock dependencies
vi.mock('../services/event-service', () => ({
  EventService: {
    getAllPublicEvents: vi.fn(),
    getPublicEventVisibleById: vi.fn(),
    createEvent: vi.fn(),
    getUserEvents: vi.fn(),
    getEventById: vi.fn(),
    updateEvent: vi.fn(),
    softDeleteEvent: vi.fn(),
  },
}));

vi.mock('../services/image-upload', () => ({
  ImageUploadService: {
    uploadImage: vi.fn(),
  },
}));

vi.mock('@repo/db', () => ({
  prisma: {
    categoriaevento: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn(),
  },
}));

vi.mock('dotenv', () => ({
  config: vi.fn(),
}));

describe('Events Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BETTER_AUTH_SECRET = 'test-secret';
    process.env.FRONTEND_URL = 'http://localhost:3000';
  });

  describe('GET /all', () => {
    it('should return all public events', async () => {
      const { EventService } = await import('../services/event-service.js');
      const mockEvents = [
        {
          eventoid: 'event-1',
          titulo: 'Test Event',
          descripcion: 'Test Description',
          creadorid: 'user-123',
        },
      ];

      vi.mocked(EventService.getAllPublicEvents).mockResolvedValue(mockEvents as any);

      const res = await events.request('/all');
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toEqual({
        events: mockEvents,
        total: 1,
      });
    });

    it('should handle errors when getting all events', async () => {
      const { EventService } = await import('../services/event-service.js');

      vi.mocked(EventService.getAllPublicEvents).mockRejectedValue(new Error('Database error'));

      const res = await events.request('/all');
      expect(res.status).toBe(500);

      const body = await res.json();
      expect(body).toEqual({
        error: 'Database error',
      });
    });
  });

  describe('GET /public/:id', () => {
    it('should return public event by id', async () => {
      const { EventService } = await import('../services/event-service.js');
      const mockEvent = {
        eventoid: 'event-1',
        titulo: 'Test Event',
        descripcion: 'Test Description',
        creadorid: 'user-123',
      };

      vi.mocked(EventService.getPublicEventVisibleById).mockResolvedValue(mockEvent as any);

      const res = await events.request('/public/event-1');
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toEqual({
        event: mockEvent,
      });
    });

    it('should return 404 when event not found', async () => {
      const { EventService } = await import('../services/event-service.js');

      vi.mocked(EventService.getPublicEventVisibleById).mockResolvedValue(null);

      const res = await events.request('/public/non-existent');
      expect(res.status).toBe(404);

      const body = await res.json();
      expect(body).toEqual({
        error: 'Evento no encontrado',
      });
    });
  });

  describe('POST /', () => {
    it('should create event with valid data', async () => {
      const { EventService } = await import('../services/event-service.js');
      const mockJwtVerify = vi.mocked(jwt.verify);
      mockJwtVerify.mockReturnValue({
        id: 'user-123',
        email: 'test@example.com',
      } as any);

      const mockEvent = {
        eventoid: 'event-1',
        titulo: 'Test Event',
        creadorid: 'user-123',
      };

      vi.mocked(EventService.createEvent).mockResolvedValue(mockEvent as any);

      const eventData = {
        titulo: 'Test Event',
        fechas_evento: [{ fecha_hora: '2024-12-31T20:00:00Z' }],
      };

      const res = await events.request('/', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      expect(res.status).toBe(201);

      const body = await res.json();
      expect(body).toEqual({
        message: 'Evento creado exitosamente',
        event: mockEvent,
      });
    });

    it('should return 401 when not authenticated', async () => {
      const mockJwtVerify = vi.mocked(jwt.verify);
      mockJwtVerify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const eventData = {
        titulo: 'Test Event',
        fechas_evento: [{ fecha_hora: '2024-12-31T20:00:00Z' }],
      };

      const res = await events.request('/', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer invalid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      expect(res.status).toBe(401);

      const body = await res.json();
      expect(body).toEqual({
        error: 'Usuario no autenticado',
      });
    });

    it('should return 400 when missing required fields', async () => {
      const mockJwtVerify = vi.mocked(jwt.verify);
      mockJwtVerify.mockReturnValue({
        id: 'user-123',
        email: 'test@example.com',
      } as any);

      const eventData = {
        titulo: 'Test Event',
        // Missing fechas_evento
      };

      const res = await events.request('/', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      expect(res.status).toBe(400);

      const body = await res.json();
      expect(body).toEqual({
        error: 'Faltan campos requeridos: titulo, fechas_evento',
      });
    });
  });

  describe('GET /categories', () => {
    it('should return categories', async () => {
      const mockPrisma = await import('@repo/db');
      const mockCategories = [
        {
          categoriaeventoid: 1,
          nombre: 'Conciertos',
          descripcion: 'Eventos musicales',
        },
        {
          categoriaeventoid: 2,
          nombre: 'Deportes',
          descripcion: 'Eventos deportivos',
        },
      ];

      vi.mocked(mockPrisma.prisma.categoriaevento.findMany).mockResolvedValue(
        mockCategories as any,
      );

      const res = await events.request('/categories');
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toEqual({
        categories: [
          {
            id: 1,
            name: 'Conciertos',
            description: 'Eventos musicales',
          },
          {
            id: 2,
            name: 'Deportes',
            description: 'Eventos deportivos',
          },
        ],
      });
    });

    it('should handle errors when getting categories', async () => {
      const mockPrisma = await import('@repo/db');

      vi.mocked(mockPrisma.prisma.categoriaevento.findMany).mockRejectedValue(
        new Error('Database error'),
      );

      const res = await events.request('/categories');
      expect(res.status).toBe(500);

      const body = await res.json();
      expect(body).toEqual({
        error: 'Database error',
      });
    });
  });

  describe('GET /', () => {
    it('should return user events when authenticated', async () => {
      const { EventService } = await import('../services/event-service.js');
      const mockJwtVerify = vi.mocked(jwt.verify);
      mockJwtVerify.mockReturnValue({
        id: 'user-123',
        email: 'test@example.com',
      } as any);

      const mockEvents = [
        {
          eventoid: 'event-1',
          titulo: 'User Event',
          creadorid: 'user-123',
        },
      ];

      vi.mocked(EventService.getUserEvents).mockResolvedValue(mockEvents as any);

      const res = await events.request('/', {
        headers: {
          Authorization: 'Bearer valid-token',
        },
      });

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toEqual({
        events: mockEvents,
        total: 1,
        userId: 'user-123',
      });
    });

    it('should return 401 when not authenticated', async () => {
      const mockJwtVerify = vi.mocked(jwt.verify);
      mockJwtVerify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const res = await events.request('/', {
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      });

      expect(res.status).toBe(401);

      const body = await res.json();
      expect(body).toEqual({
        error: 'Usuario no autenticado',
      });
    });
  });

  describe('POST /upload-image', () => {
    it('should upload image successfully', async () => {
      const { ImageUploadService } = await import('../services/image-upload.js');
      const mockJwtVerify = vi.mocked(jwt.verify);
      mockJwtVerify.mockReturnValue({
        id: 'user-123',
        email: 'test@example.com',
      } as any);

      const mockUploadResult = {
        url: 'https://example.com/image.jpg',
        publicId: 'test/image',
        format: 'jpg',
        size: 1024,
      };

      vi.mocked(ImageUploadService.uploadImage).mockResolvedValue(mockUploadResult);

      // Create a mock FormData with file
      const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
      const body = [
        `------WebKitFormBoundary7MA4YWxkTrZu0gW`,
        `Content-Disposition: form-data; name="file"; filename="test.jpg"`,
        `Content-Type: image/jpeg`,
        ``,
        `fake-image-data`,
        `------WebKitFormBoundary7MA4YWxkTrZu0gW--`,
      ].join('\r\n');

      const res = await events.request('/upload-image', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer valid-token',
          'Content-Type': `multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW`,
        },
        body,
      });

      expect(res.status).toBe(200);

      const responseBody = await res.json();
      expect(responseBody).toEqual({
        message: 'Imagen subida exitosamente',
        image: mockUploadResult,
        userId: 'user-123',
      });
    });

    it('should return 400 when no file provided', async () => {
      const mockJwtVerify = vi.mocked(jwt.verify);
      mockJwtVerify.mockReturnValue({
        id: 'user-123',
        email: 'test@example.com',
      } as any);

      // Empty multipart body
      const body = `------WebKitFormBoundary7MA4YWxkTrZu0gW--\r\n`;

      const res = await events.request('/upload-image', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer valid-token',
          'Content-Type': `multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW`,
        },
        body,
      });

      expect(res.status).toBe(400);

      const responseBody = await res.json();
      expect(responseBody).toEqual({
        error: 'No se proporcionó ninguna imagen válida',
      });
    });
  });

  describe('POST /publish-scheduled', () => {
    it('should publish scheduled events', async () => {
      const { EventService } = await import('../services/event-service.js');

      const mockResult = {
        published: 2,
        errors: 0,
      };

      // Mock the method properly
      const mockPublishScheduledEvents = vi.fn().mockResolvedValue(mockResult);
      EventService.publishScheduledEvents = mockPublishScheduledEvents;

      const res = await events.request('/publish-scheduled', {
        method: 'POST',
      });

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toEqual({
        message: 'Eventos programados procesados',
        published: 2,
        errors: 0,
        timestamp: expect.any(String),
      });
    });
  });
});
