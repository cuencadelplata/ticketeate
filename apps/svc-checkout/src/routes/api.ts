import { Hono } from 'hono';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { events } from './events';

const api = new Hono();

api.use('*', clerkMiddleware());

// clerk auth middleware inyectado en todas las rutas
api.route('/events', events);

// GET /api/users/:id
api.get('/users/:id', c => {
  const auth = getAuth(c);

  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = c.req.param('id');
  return c.json({
    id: parseInt(id),
    name: 'John Doe',
    email: 'john@example.com',
    authenticatedUserId: auth.userId,
  });
});

// POST /api/users
api.post('/users', async c => {
  const auth = getAuth(c);

  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = await c.req.json();
  return c.json(
    {
      message: 'User created successfully',
      user: body,
      authenticatedUserId: auth.userId,
    },
    201
  );
});

// PUT /api/users/:id
api.put('/users/:id', async c => {
  const auth = getAuth(c);

  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = c.req.param('id');
  const body = await c.req.json();
  return c.json({
    message: 'User updated successfully',
    id: parseInt(id),
    user: body,
    authenticatedUserId: auth.userId,
  });
});

// DELETE /api/users/:id
api.delete('/users/:id', c => {
  const auth = getAuth(c);

  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = c.req.param('id');
  return c.json({
    message: 'User deleted successfully',
    id: parseInt(id),
    authenticatedUserId: auth.userId,
  });
});

// Protected route example
api.get('/protected/profile', c => {
  const auth = getAuth(c);

  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  return c.json({
    message: 'This is a protected route',
    user: {
      id: auth.userId,
      name: 'John Doe',
      role: 'admin',
    },
  });
});

export { api as apiRoutes };
