import { Hono, Context } from 'hono';
import { cors } from 'hono/cors';
import { EventService, CreateEventData } from '../services/event-service';
import { ImageUploadService } from '../services/image-upload';
import { prisma } from '@repo/db';
import { config } from 'dotenv';
import jwt from 'jsonwebtoken';
import { logger } from '../logger';

// Cargar variables de entorno
config();

const events = new Hono();

// Helper function to validate JWT token using traditional JWT
function validateJWT(c: Context) {
  try {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token using shared secret
    const payload = jwt.verify(token, process.env.BETTER_AUTH_SECRET!, {
      issuer: process.env.FRONTEND_URL || 'http://localhost:3000',
      audience: process.env.FRONTEND_URL || 'http://localhost:3000',
      algorithms: ['HS256'], // Specify algorithm
    });

    return payload as jwt.JwtPayload;
  } catch (error) {
    logger.error('JWT validation failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

// CORS para permitir Authorization y cookies (credenciales)
events.use(
  '*',
  cors({
    origin: (origin) => origin ?? '*',
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Authorization', 'Content-Type', 'X-Requested-With'],
    exposeHeaders: ['*'],
    credentials: true,
    maxAge: 86400,
  }),
);

// GET /api/events/all - Público: Obtener todos los eventos (activos y pasados)
events.get('/all', async (c) => {
  try {
    const events = await EventService.getAllPublicEvents();

    return c.json({
      events,
      total: events.length,
    });
  } catch (error) {
    logger.error('Error getting all events', {
      error: error instanceof Error ? error.message : String(error),
    });
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      },
      500,
    );
  }
});

// GET /api/events/public/:id - Público: Obtener evento por id (respetando visibilidad)
events.get('/public/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const event = await EventService.getPublicEventVisibleById(id);
    if (!event) {
      return c.json({ error: 'Evento no encontrado' }, 404);
    }
    return c.json({ event });
  } catch (error) {
    logger.error('Error getting public event', {
      error: error instanceof Error ? error.message : String(error),
    });
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      },
      500,
    );
  }
});

// POST /api/events - Crear un nuevo evento
events.post('/', async (c) => {
  try {
    // Validate JWT token directly
    const jwtPayload = validateJWT(c);

    if (!jwtPayload?.id) {
      return c.json({ error: 'Usuario no autenticado' }, 401);
    }

    const body = await c.req.json();

    // Validar datos requeridos
    if (!body.titulo || !body.fechas_evento || body.fechas_evento.length === 0) {
      return c.json(
        {
          error: 'Faltan campos requeridos: titulo, fechas_evento',
        },
        400,
      );
    }

    // Preparar datos del evento
    const eventData: CreateEventData = {
      titulo: body.titulo,
      descripcion: body.descripcion,
      ubicacion: body.ubicacion,
      estado: body.estado || 'OCULTO',
      imageUrl: body.imageUrl, // URL de imagen de portada ya subida a Cloudinary
      galeria_imagenes: body.galeria_imagenes, // Array de URLs de galería
      fechas_evento: body.fechas_evento.map(
        (fecha: { fecha_hora: string; fecha_fin?: string }) => ({
          fecha_hora: new Date(fecha.fecha_hora),
          fecha_fin: fecha.fecha_fin ? new Date(fecha.fecha_fin) : undefined,
        }),
      ),
      eventMap: body.eventMap, // Mapa del canvas con sectores y elementos
      userId: jwtPayload.id,
      ticket_types: body.ticket_types,
      fecha_publicacion: body.fecha_publicacion, // Fecha programada para publicar el evento
    };

    // Crear el evento
    const createdEvent = await EventService.createEvent(eventData);

    return c.json(
      {
        message: 'Evento creado exitosamente',
        event: createdEvent,
      },
      201,
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error creating event:', error);
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      },
      500,
    );
  }
});

// POST /api/events/upload-image - Subir imagen para un evento
events.post('/upload-image', async (c) => {
  try {
    const jwtPayload = validateJWT(c);
    if (!jwtPayload?.id) {
      return c.json({ error: 'Usuario no autenticado' }, 401);
    }

    // Usar formData para procesar el archivo
    const formData = await c.req.formData();
    const file = formData.get('file');

    if (!file || typeof file !== 'object' || !('arrayBuffer' in file)) {
      return c.json({ error: 'No se proporcionó ninguna imagen válida' }, 400);
    }

    // Convertir File a Buffer
    const arrayBuffer = await (file as { arrayBuffer(): Promise<ArrayBuffer> }).arrayBuffer();
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
      userId: jwtPayload.id,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error uploading image:', error);
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      },
      500,
    );
  }
});

// GET /api/events/categories - Obtener todas las categorías disponibles
events.get('/categories', async (c) => {
  try {
    const categories = await prisma.categoriaevento.findMany({
      orderBy: { nombre: 'asc' },
    });

    return c.json({
      categories: categories.map((cat) => ({
        id: cat.categoriaeventoid, // Now it's a number, no conversion needed
        name: cat.nombre,
        description: cat.descripcion,
      })),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error getting categories:', error);
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      },
      500,
    );
  }
});

// GET /api/events - Obtener eventos del usuario
events.get('/', async (c) => {
  try {
    // Use direct JWT validation like POST route
    const jwtPayload = validateJWT(c);

    if (!jwtPayload?.id) {
      return c.json({ error: 'Usuario no autenticado' }, 401);
    }

    const events = await EventService.getUserEvents(jwtPayload.id);

    return c.json({
      events,
      total: events.length,
      userId: jwtPayload.id,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error getting events:', error);
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      },
      500,
    );
  }
});

// GET /api/events/:id - Obtener evento específico
events.get('/:id', async (c) => {
  try {
    const jwtPayload = validateJWT(c);
    if (!jwtPayload?.id) {
      return c.json({ error: 'Usuario no autenticado' }, 401);
    }

    const id = c.req.param('id');

    const event = await EventService.getEventById(id);

    if (!event) {
      return c.json({ error: 'Evento no encontrado' }, 404);
    }

    return c.json({
      event,
      userId: jwtPayload.id,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error getting event:', error);
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      },
      500,
    );
  }
});

// PUT /api/events/:id - Actualizar un evento
events.put('/:id', async (c) => {
  try {
    const jwtPayload = validateJWT(c);
    if (!jwtPayload?.id) {
      return c.json({ error: 'Usuario no autenticado' }, 401);
    }

    const id = c.req.param('id');
    const body = await c.req.json();

    const updated = await EventService.updateEvent(id, jwtPayload.id, {
      titulo: body.titulo,
      descripcion: body.descripcion,
      ubicacion: body.ubicacion,
      estado: body.estado,
      imageUrl: body.imageUrl,
      galeria_imagenes: body.galeria_imagenes,
      fechas_evento: body.fechas_evento?.map(
        (fecha: { fecha_hora: string; fecha_fin?: string }) => ({
          fecha_hora: new Date(fecha.fecha_hora),
          fecha_fin: fecha.fecha_fin ? new Date(fecha.fecha_fin) : undefined,
        }),
      ),
      eventMap: body.eventMap,
      ticket_types: body.ticket_types,
    });

    return c.json({
      message: 'Evento actualizado exitosamente (soft update)',
      event: updated,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error updating event:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      500,
    );
  }
});

// DELETE /api/events/:id - Borrado lógico
events.delete('/:id', async (c) => {
  try {
    const jwtPayload = validateJWT(c);
    if (!jwtPayload?.id) {
      return c.json({ error: 'Usuario no autenticado' }, 401);
    }

    const id = c.req.param('id');
    await EventService.softDeleteEvent(id, jwtPayload.id);
    return c.json({ message: 'Evento ocultado (borrado lógico) correctamente' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error deleting event:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      500,
    );
  }
});

// POST /api/events/:id/categories - agregar categorías a un evento
events.post('/:id/categories', async (c) => {
  try {
    const jwtPayload = validateJWT(c);
    if (!jwtPayload?.id) {
      return c.json({ error: 'Usuario no autenticado' }, 401);
    }

    const id = c.req.param('id');

    // Verificar owner
    const event = await EventService.getEventById(id);
    if (!event) return c.json({ error: 'Evento no encontrado' }, 404);
    if (event.creadorid !== jwtPayload.id) return c.json({ error: 'No autorizado' }, 403);

    // TODO: Implementar métodos en EventService
    // const linked = await EventService.addCategoriesToEvent(id, categories);
    return c.json({ message: 'Categorías actualizadas', categories: [] });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error adding categories:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      500,
    );
  }
});

// DELETE /api/events/:id/categories/:categoryId - quitar categoría de un evento
events.delete('/:id/categories/:categoryId', async (c) => {
  try {
    const jwtPayload = validateJWT(c);
    if (!jwtPayload?.id) {
      return c.json({ error: 'Usuario no autenticado' }, 401);
    }

    const id = c.req.param('id');

    const event = await EventService.getEventById(id);
    if (!event) return c.json({ error: 'Evento no encontrado' }, 404);
    if (event.creadorid !== jwtPayload.id) return c.json({ error: 'No autorizado' }, 403);

    // TODO: Implementar métodos en EventService
    // const remaining = await EventService.removeCategoryFromEvent(id, categoryId);
    return c.json({ message: 'Categoría removida', categories: [] });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error removing category:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      500,
    );
  }
});

// POST /api/events/publish-scheduled - Publicar eventos programados (para uso interno/cron)
events.post('/publish-scheduled', async (c) => {
  try {
    const result = await EventService.publishScheduledEvents();

    return c.json({
      message: 'Eventos programados procesados',
      published: result.published,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error publishing scheduled events', {
      error: error instanceof Error ? error.message : String(error),
    });
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      },
      500,
    );
  }
});

// ===== INVITE CODES ENDPOINTS =====

// POST /api/events/:eventoid/invite-codes - Crear código de invitación
events.post('/:eventoid/invite-codes', async (c) => {
  try {
    const { InviteCodeService } = await import('../services/invite-code-service');
    const jwtPayload = validateJWT(c);

    if (!jwtPayload?.id) {
      return c.json({ error: 'No autenticado' }, 401);
    }

    const eventoid = c.req.param('eventoid');
    const { codigo, fecha_expiracion, usos_max } = await c.req.json();

    const inviteCode = await InviteCodeService.createInviteCode({
      eventoid,
      creadorid: jwtPayload.id as string,
      codigo,
      fecha_expiracion: fecha_expiracion ? new Date(fecha_expiracion) : undefined,
      usos_max,
    });

    return c.json(inviteCode, 201);
  } catch (error) {
    logger.error('Error creating invite code', {
      error: error instanceof Error ? error.message : String(error),
    });
    return c.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      500,
    );
  }
});

// GET /api/events/:eventoid/invite-codes - Obtener códigos de invitación
events.get('/:eventoid/invite-codes', async (c) => {
  try {
    const { InviteCodeService } = await import('../services/invite-code-service');
    const jwtPayload = validateJWT(c);

    if (!jwtPayload?.id) {
      return c.json({ error: 'No autenticado' }, 401);
    }

    const eventoid = c.req.param('eventoid');
    const codes = await InviteCodeService.getInviteCodesByEvent(eventoid, jwtPayload.id as string);

    return c.json({ codes });
  } catch (error) {
    logger.error('Error getting invite codes', {
      error: error instanceof Error ? error.message : String(error),
    });
    return c.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      500,
    );
  }
});

// PUT /api/events/:eventoid/invite-codes/:codigoid - Desactivar código
events.put('/:eventoid/invite-codes/:codigoid/deactivate', async (c) => {
  try {
    const { InviteCodeService } = await import('../services/invite-code-service');
    const jwtPayload = validateJWT(c);

    if (!jwtPayload?.id) {
      return c.json({ error: 'No autenticado' }, 401);
    }

    const codigoid = c.req.param('codigoid');
    const result = await InviteCodeService.deactivateInviteCode(codigoid, jwtPayload.id as string);

    return c.json(result);
  } catch (error) {
    logger.error('Error deactivating invite code', {
      error: error instanceof Error ? error.message : String(error),
    });
    return c.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      500,
    );
  }
});

// GET /api/events/:eventoid/colaboradores - Obtener colaboradores del evento
events.get('/:eventoid/colaboradores', async (c) => {
  try {
    const { InviteCodeService } = await import('../services/invite-code-service');
    const jwtPayload = validateJWT(c);

    if (!jwtPayload?.id) {
      return c.json({ error: 'No autenticado' }, 401);
    }

    const eventoid = c.req.param('eventoid');
    const colaboradores = await InviteCodeService.getColaboradorsByEvent(
      eventoid,
      jwtPayload.id as string,
    );

    return c.json({ colaboradores });
  } catch (error) {
    logger.error('Error getting colaboradores', {
      error: error instanceof Error ? error.message : String(error),
    });
    return c.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      500,
    );
  }
});

// ===== SCANNER ENDPOINTS =====

// GET /api/events/:eventoid/stats - Obtener estadísticas de tickets
events.get('/:eventoid/stats', async (c) => {
  try {
    const { ScannerService } = await import('../services/scanner-service');
    const jwtPayload = validateJWT(c);

    if (!jwtPayload?.id) {
      return c.json({ error: 'No autenticado' }, 401);
    }

    const eventoid = c.req.param('eventoid');
    const stats = await ScannerService.getTicketStats(eventoid, jwtPayload.id as string);

    return c.json(stats);
  } catch (error) {
    logger.error('Error getting stats', {
      error: error instanceof Error ? error.message : String(error),
    });
    return c.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      403,
    );
  }
});

// POST /api/events/:eventoid/scan - Escanear un ticket
events.post('/:eventoid/scan', async (c) => {
  try {
    const { ScannerService } = await import('../services/scanner-service');
    const jwtPayload = validateJWT(c);

    if (!jwtPayload?.id) {
      return c.json({ error: 'No autenticado' }, 401);
    }

    const eventoid = c.req.param('eventoid');
    const { codigo_qr } = await c.req.json();

    if (!codigo_qr) {
      return c.json({ error: 'Código QR requerido' }, 400);
    }

    const result = await ScannerService.scanTicket(eventoid, codigo_qr, jwtPayload.id as string);

    return c.json(result);
  } catch (error) {
    logger.error('Error scanning ticket', {
      error: error instanceof Error ? error.message : String(error),
    });
    return c.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      400,
    );
  }
});

// GET /api/events/:eventoid/tickets - Obtener entradas de un evento
events.get('/:eventoid/tickets', async (c) => {
  try {
    const { ScannerService } = await import('../services/scanner-service');
    const jwtPayload = validateJWT(c);

    if (!jwtPayload?.id) {
      return c.json({ error: 'No autenticado' }, 401);
    }

    const eventoid = c.req.param('eventoid');
    const estado = (c.req.query('estado') as 'VALIDA' | 'USADA' | 'CANCELADA') || undefined;

    const tickets = await ScannerService.getEventoEntradas(
      eventoid,
      jwtPayload.id as string,
      estado,
    );

    return c.json({ tickets });
  } catch (error) {
    logger.error('Error getting tickets', {
      error: error instanceof Error ? error.message : String(error),
    });
    return c.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      403,
    );
  }
});

// GET /api/events/:eventoid/activity - Obtener actividad del scanner
events.get('/:eventoid/activity', async (c) => {
  try {
    const { ScannerService } = await import('../services/scanner-service');
    const jwtPayload = validateJWT(c);

    if (!jwtPayload?.id) {
      return c.json({ error: 'No autenticado' }, 401);
    }

    const eventoid = c.req.param('eventoid');
    const activity = await ScannerService.getScannerActivity(eventoid, jwtPayload.id as string);

    return c.json(activity);
  } catch (error) {
    logger.error('Error getting activity', {
      error: error instanceof Error ? error.message : String(error),
    });
    return c.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      403,
    );
  }
});

export { events };
