import { Hono } from 'hono';
import { InviteCodeService } from '../services/invite-code-service';
import * as jwt from 'jsonwebtoken';
import { logger } from '../logger';

const inviteRoutes = new Hono();

// POST /api/invite-codes/validate - Validar código de invitación (público para registro)
inviteRoutes.post('/validate', async (c) => {
  try {
    const { codigo } = await c.req.json();

    if (!codigo) {
      return c.json({ error: 'Código requerido' }, 400);
    }

    const result = await InviteCodeService.validateInviteCode(codigo);

    return c.json({
      valid: true,
      ...result,
    });
  } catch (error) {
    logger.error('Error validating invite code', {
      error: error instanceof Error ? error.message : String(error),
    });
    return c.json(
      {
        valid: false,
        error: error instanceof Error ? error.message : 'Error al validar código',
      },
      400,
    );
  }
});

// POST /api/invite-codes/use - Usar código de invitación (para colaboradores registrados)
inviteRoutes.post('/use', async (c) => {
  try {
    // Este endpoint requiere autenticación
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'No autenticado' }, 401);
    }

    const { codigo } = await c.req.json();
    if (!codigo) {
      return c.json({ error: 'Código requerido' }, 400);
    }

    // Extraer usuario ID del JWT
    const token = authHeader.substring(7);
    const payload = jwt.verify(token, process.env.BETTER_AUTH_SECRET!, {
      issuer: process.env.FRONTEND_URL || 'http://localhost:3000',
      audience: process.env.FRONTEND_URL || 'http://localhost:3000',
      algorithms: ['HS256'],
    }) as jwt.JwtPayload;

    if (!payload?.id) {
      return c.json({ error: 'No autenticado' }, 401);
    }

    const result = await InviteCodeService.useInviteCode(codigo, payload.id);

    return c.json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error('Error using invite code', {
      error: error instanceof Error ? error.message : String(error),
    });
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al usar código',
      },
      400,
    );
  }
});

// GET /api/invite-codes/my-event - Obtener evento asignado (para colaborador)
inviteRoutes.get('/my-event', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'No autenticado' }, 401);
    }

    const token = authHeader.substring(7);
    const payload = jwt.verify(token, process.env.BETTER_AUTH_SECRET!, {
      issuer: process.env.FRONTEND_URL || 'http://localhost:3000',
      audience: process.env.FRONTEND_URL || 'http://localhost:3000',
      algorithms: ['HS256'],
    }) as jwt.JwtPayload;

    if (!payload?.id) {
      return c.json({ error: 'No autenticado' }, 401);
    }

    const eventos = await InviteCodeService.getEventoByColaborador(payload.id);

    return c.json({ eventos });
  } catch (error) {
    logger.error('Error getting my event', {
      error: error instanceof Error ? error.message : String(error),
    });
    return c.json(
      {
        error: error instanceof Error ? error.message : 'No hay evento asignado',
      },
      400,
    );
  }
});

export { inviteRoutes };
