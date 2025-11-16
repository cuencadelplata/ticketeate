import { Hono, Context } from 'hono';
import { recordPurchaseConfirmed, recordPurchaseCancelled, recordPurchaseError } from '@ticketeate/telemetry';

const api = new Hono();

// Helper function to get JWT payload from context
function getJwtPayload(c: Context) {
  return c.get('jwtPayload');
}

// GET /api/users/:id
api.get('/users/:id', (c) => {
  const jwtPayload = getJwtPayload(c);

  if (!jwtPayload?.id) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = c.req.param('id');
  return c.json({
    id: Number.parseInt(id),
    name: 'John Doe',
    email: 'john@example.com',
    authenticatedUserId: jwtPayload.id,
    userRole: jwtPayload.role,
  });
});

// POST /api/users
api.post('/users', async (c) => {
  const jwtPayload = getJwtPayload(c);

  if (!jwtPayload?.id) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = await c.req.json();
  return c.json(
    {
      message: 'User created successfully',
      user: body,
      authenticatedUserId: jwtPayload.id,
      userRole: jwtPayload.role,
    },
    201,
  );
});

// PUT /api/users/:id
api.put('/users/:id', async (c) => {
  const jwtPayload = getJwtPayload(c);

  if (!jwtPayload?.id) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = c.req.param('id');
  const body = await c.req.json();
  return c.json({
    message: 'User updated successfully',
    id: Number.parseInt(id),
    user: body,
    authenticatedUserId: jwtPayload.id,
    userRole: jwtPayload.role,
  });
});

// DELETE /api/users/:id
api.delete('/users/:id', (c) => {
  const jwtPayload = getJwtPayload(c);

  if (!jwtPayload?.id) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = c.req.param('id');
  return c.json({
    message: 'User deleted successfully',
    id: Number.parseInt(id),
    authenticatedUserId: jwtPayload.id,
    userRole: jwtPayload.role,
  });
});

// Protected route example
api.get('/protected/profile', (c) => {
  const jwtPayload = getJwtPayload(c);

  if (!jwtPayload?.id) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  return c.json({
    message: 'This is a protected route',
    user: {
      id: jwtPayload.id,
      name: jwtPayload.name,
      email: jwtPayload.email,
      role: jwtPayload.role,
    },
  });
});

export { api as apiRoutes };

// POST /api/telemetry/ingest - endpoint simple para recibir eventos de telemetría
// Espera body: { type: 'purchase_confirmed'|'purchase_cancelled'|'purchase_error', eventId?, userId?, attrs? }
// Opcional: proteger con header 'x-telemetry-secret' igual a env TELEMETRY_INGEST_SECRET
api.post('/telemetry/ingest', async (c) => {
  try {
    const secret = process.env.TELEMETRY_INGEST_SECRET;
    if (secret) {
      const header = c.req.header('x-telemetry-secret');
      if (header !== secret) return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { type, eventId, userId, attrs } = body || {};

    const commonAttrs: Record<string, any> = { eventId, userId };
    if (attrs && typeof attrs === 'object') {
      Object.assign(commonAttrs, attrs);
    }

    if (type === 'purchase_confirmed') {
      recordPurchaseConfirmed(commonAttrs);
    } else if (type === 'purchase_cancelled') {
      recordPurchaseCancelled(commonAttrs);
    } else if (type === 'purchase_error') {
      recordPurchaseError(commonAttrs);
    } else {
      return c.json({ error: 'Unknown event type' }, 400);
    }

    return c.json({ ok: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Telemetry ingest error:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});
