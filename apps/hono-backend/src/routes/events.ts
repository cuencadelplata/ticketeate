import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { EventService, CreateEventData } from '../services/event-service';
import { ImageUploadService } from '../services/image-upload';
import { config } from 'dotenv';

// Cargar variables de entorno
config();
const events = new Hono();

events.use(
  '*',
  clerkMiddleware({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  })
);

// POST /api/events - Crear un nuevo evento
events.post('/', async c => {
  try {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ error: 'Usuario no autenticado' }, 401);
    }

    const body = await c.req.json();

    // Validar datos requeridos
    if (!body.titulo || !body.fecha_inicio_venta || !body.fecha_fin_venta) {
      return c.json(
        {
          error:
            'Faltan campos requeridos: titulo, fecha_inicio_venta, fecha_fin_venta',
        },
        400
      );
    }

    // Preparar datos del evento
    const eventData: CreateEventData = {
      titulo: body.titulo,
      descripcion: body.descripcion,
      ubicacion: body.ubicacion,
      fecha_inicio_venta: new Date(body.fecha_inicio_venta),
      fecha_fin_venta: new Date(body.fecha_fin_venta),
      estado: body.estado || 'OCULTO',
      imageUrl: body.imageUrl, // URL de imagen de portada ya subida a Cloudinary
      galeria_imagenes: body.galeria_imagenes, // Array de URLs de galería
      fechas_adicionales: body.fechas_adicionales?.map((fecha: any) => ({
        fecha_inicio: new Date(fecha.fecha_inicio),
        fecha_fin: new Date(fecha.fecha_fin),
      })),
      clerkUserId: auth.userId,
    };

    // Crear el evento
    const createdEvent = await EventService.createEvent(eventData);

    return c.json(
      {
        message: 'Evento creado exitosamente',
        event: createdEvent,
      },
      201
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error creating event:', error);
    return c.json(
      {
        error:
          error instanceof Error ? error.message : 'Error interno del servidor',
      },
      500
    );
  }
});

// POST /api/events/upload-image - Subir imagen para un evento
events.post('/upload-image', async c => {
  try {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ error: 'Usuario no autenticado' }, 401);
    }

    // Usar formData para procesar el archivo
    const formData = await c.req.formData();
    const file = formData.get('file');

    if (!file || typeof file !== 'object' || !('arrayBuffer' in file)) {
      return c.json({ error: 'No se proporcionó ninguna imagen válida' }, 400);
    }

    // Convertir File a Buffer
    const arrayBuffer = await (
      file as { arrayBuffer(): Promise<ArrayBuffer> }
    ).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Subir imagen a Cloudinary
    const uploadResult = await ImageUploadService.uploadImage(buffer);

    return c.json({
      message: 'Imagen subida exitosamente',
      image: {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
        format: uploadResult.format,
        size: uploadResult.size,
      },
      userId: auth.userId,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error uploading image:', error);
    return c.json(
      {
        error:
          error instanceof Error ? error.message : 'Error interno del servidor',
      },
      500
    );
  }
});

// GET /api/events - Obtener eventos del usuario
events.get('/', async c => {
  try {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ error: 'Usuario no autenticado' }, 401);
    }

    const events = await EventService.getUserEvents(auth.userId);

    return c.json({
      events,
      total: events.length,
      userId: auth.userId,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error getting events:', error);
    return c.json(
      {
        error:
          error instanceof Error ? error.message : 'Error interno del servidor',
      },
      500
    );
  }
});

// GET /api/events/:id - Obtener evento específico
events.get('/:id', async c => {
  try {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ error: 'Usuario no autenticado' }, 401);
    }

    const id = c.req.param('id');

    const event = await EventService.getEventById(id);

    if (!event) {
      return c.json({ error: 'Evento no encontrado' }, 404);
    }

    return c.json({
      event,
      userId: auth.userId,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error getting event:', error);
    return c.json(
      {
        error:
          error instanceof Error ? error.message : 'Error interno del servidor',
      },
      500
    );
  }
});

export { events };
