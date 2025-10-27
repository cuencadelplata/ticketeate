import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock de Clerk Auth
vi.mock('@hono/clerk-auth', () => ({
  clerkMiddleware: vi.fn(() => (c: any, next: any) => next()),
  getAuth: vi.fn(),
}));

// Mock de los servicios
vi.mock('../services/event-service', () => ({
  EventService: {
    createEvent: vi.fn(),
    getUserEvents: vi.fn(),
    getEventById: vi.fn(),
  },
}));

vi.mock('../services/image-upload', () => ({
  ImageUploadService: {
    uploadImage: vi.fn(),
  },
}));

// Mock de dotenv
vi.mock('dotenv', () => ({
  config: vi.fn(),
}));

import { events } from '../routes/events';
import { EventService } from '../services/event-service';
import { ImageUploadService } from '../services/image-upload';
import { getAuth } from '@hono/clerk-auth';

describe('Events Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/events', () => {
    it('should create event when authenticated with valid data', async () => {
      vi.mocked(getAuth).mockReturnValue({ userId: 'user-123' });

      const mockEvent = {
        eventoid: 'event-123',
        titulo: 'Test Event',
        descripcion: 'Test Description',
        creadorid: 'user-123',
        imagenes_evento: [],
        fechas_evento: [],
      };

      vi.mocked(EventService.createEvent).mockResolvedValue(mockEvent);

      const eventData = {
        titulo: 'Test Event',
        descripcion: 'Test Description',
        fecha_inicio_venta: '2024-12-01T00:00:00Z',
        fecha_fin_venta: '2024-12-31T23:59:59Z',
        estado: 'OCULTO',
      };

      const res = await events.request('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });

      expect(res.status).toBe(201);

      const body = await res.json();
      expect(body).toHaveProperty('message', 'Evento creado exitosamente');
      expect(body).toHaveProperty('event', mockEvent);

      expect(EventService.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          titulo: 'Test Event',
          descripcion: 'Test Description',
          clerkUserId: 'user-123',
        }),
      );
    });

    it('should return 401 when not authenticated', async () => {
      vi.mocked(getAuth).mockReturnValue(null);

      const eventData = {
        titulo: 'Test Event',
        fecha_inicio_venta: '2024-12-01T00:00:00Z',
        fecha_fin_venta: '2024-12-31T23:59:59Z',
      };

      const res = await events.request('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });

      expect(res.status).toBe(401);

      const body = await res.json();
      expect(body).toHaveProperty('error', 'Usuario no autenticado');
    });

    it('should return 400 when required fields are missing', async () => {
      vi.mocked(getAuth).mockReturnValue({ userId: 'user-123' });

      const eventData = {
        descripcion: 'Test Description',
        // Missing titulo, fecha_inicio_venta, fecha_fin_venta
      };

      const res = await events.request('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });

      expect(res.status).toBe(400);

      const body = await res.json();
      expect(body).toHaveProperty('error');
      expect(body.error).toContain('Faltan campos requeridos');
    });

    it('should handle service errors gracefully', async () => {
      vi.mocked(getAuth).mockReturnValue({ userId: 'user-123' });
      vi.mocked(EventService.createEvent).mockRejectedValue(new Error('Database error'));

      const eventData = {
        titulo: 'Test Event',
        fecha_inicio_venta: '2024-12-01T00:00:00Z',
        fecha_fin_venta: '2024-12-31T23:59:59Z',
      };

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const res = await events.request('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });

      expect(res.status).toBe(500);

      const body = await res.json();
      expect(body).toHaveProperty('error', 'Database error');

      expect(consoleSpy).toHaveBeenCalledWith('Error creating event:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('POST /api/events/upload-image', () => {
    it('should upload image when authenticated', async () => {
      vi.mocked(getAuth).mockReturnValue({ userId: 'user-123' });

      const mockUploadResult = {
        url: 'https://example.com/image.jpg',
        publicId: 'image-123',
        format: 'jpg',
        size: 1024,
      };

      vi.mocked(ImageUploadService.uploadImage).mockResolvedValue(mockUploadResult);

      // Crear un mock de File
      const mockFile = {
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
      };

      const formData = new FormData();
      formData.append('file', mockFile as any);

      const res = await events.request('/upload-image', {
        method: 'POST',
        body: formData,
      });

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toHaveProperty('message', 'Imagen subida exitosamente');
      expect(body).toHaveProperty('image', mockUploadResult);
      expect(body).toHaveProperty('userId', 'user-123');

      expect(ImageUploadService.uploadImage).toHaveBeenCalled();
    });

    it('should return 401 when not authenticated', async () => {
      vi.mocked(getAuth).mockReturnValue(null);

      const res = await events.request('/upload-image', {
        method: 'POST',
      });

      expect(res.status).toBe(401);

      const body = await res.json();
      expect(body).toHaveProperty('error', 'Usuario no autenticado');
    });

    it('should return 400 when no file provided', async () => {
      vi.mocked(getAuth).mockReturnValue({ userId: 'user-123' });

      const formData = new FormData();

      const res = await events.request('/upload-image', {
        method: 'POST',
        body: formData,
      });

      expect(res.status).toBe(400);

      const body = await res.json();
      expect(body).toHaveProperty('error', 'No se proporcionó ninguna imagen válida');
    });
  });

  describe('GET /api/events', () => {
    it('should return user events when authenticated', async () => {
      vi.mocked(getAuth).mockReturnValue({ userId: 'user-123' });

      const mockEvents = [
        { eventoid: 'event-1', titulo: 'Event 1' },
        { eventoid: 'event-2', titulo: 'Event 2' },
      ];

      vi.mocked(EventService.getUserEvents).mockResolvedValue(mockEvents);

      const res = await events.request('/');

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toHaveProperty('events', mockEvents);
      expect(body).toHaveProperty('total', 2);
      expect(body).toHaveProperty('userId', 'user-123');

      expect(EventService.getUserEvents).toHaveBeenCalledWith('user-123');
    });

    it('should return 401 when not authenticated', async () => {
      vi.mocked(getAuth).mockReturnValue(null);

      const res = await events.request('/');

      expect(res.status).toBe(401);

      const body = await res.json();
      expect(body).toHaveProperty('error', 'Usuario no autenticado');
    });
  });

  describe('GET /api/events/:id', () => {
    it('should return specific event when authenticated', async () => {
      vi.mocked(getAuth).mockReturnValue({ userId: 'user-123' });

      const mockEvent = {
        eventoid: 'event-123',
        titulo: 'Test Event',
        descripcion: 'Test Description',
      };

      vi.mocked(EventService.getEventById).mockResolvedValue(mockEvent);

      const res = await events.request('/event-123');

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toHaveProperty('event', mockEvent);
      expect(body).toHaveProperty('userId', 'user-123');

      expect(EventService.getEventById).toHaveBeenCalledWith('event-123');
    });

    it('should return 404 when event not found', async () => {
      vi.mocked(getAuth).mockReturnValue({ userId: 'user-123' });
      vi.mocked(EventService.getEventById).mockResolvedValue(null);

      const res = await events.request('/non-existent-event');

      expect(res.status).toBe(404);

      const body = await res.json();
      expect(body).toHaveProperty('error', 'Evento no encontrado');
    });

    it('should return 401 when not authenticated', async () => {
      vi.mocked(getAuth).mockReturnValue(null);

      const res = await events.request('/event-123');

      expect(res.status).toBe(401);

      const body = await res.json();
      expect(body).toHaveProperty('error', 'Usuario no autenticado');
    });
  });
});
