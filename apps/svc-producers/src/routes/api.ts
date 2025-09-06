import { Hono } from 'hono';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { events } from './events';

const api = new Hono();

<<<<<<< HEAD:apps/hono-backend/src/routes/api.ts
// GET /api/users
api.get('/users', (c) => {
  return c.json({
    users: [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    ],
  });
});

// GET /api/users/:id
api.get('/users/:id', (c) => {
=======
api.use('*', clerkMiddleware());

// clerk auth middleware inyectado en todas las rutas
api.route('/events', events);

// GET /api/users/:id
api.get('/users/:id', c => {
  const auth = getAuth(c);

  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

>>>>>>> c396df71e96c17c0aaaa9eb6650b5a952324be06:apps/svc-producers/src/routes/api.ts
  const id = c.req.param('id');
  return c.json({
    id: parseInt(id),
    name: 'John Doe',
    email: 'john@example.com',
    authenticatedUserId: auth.userId,
  });
});

// POST /api/users
<<<<<<< HEAD:apps/hono-backend/src/routes/api.ts
api.post('/users', async (c) => {
=======
api.post('/users', async c => {
  const auth = getAuth(c);

  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

>>>>>>> c396df71e96c17c0aaaa9eb6650b5a952324be06:apps/svc-producers/src/routes/api.ts
  const body = await c.req.json();
  return c.json(
    {
      message: 'User created successfully',
      user: body,
      authenticatedUserId: auth.userId,
    },
    201,
  );
});

// PUT /api/users/:id
<<<<<<< HEAD:apps/hono-backend/src/routes/api.ts
api.put('/api/users/:id', async (c) => {
=======
api.put('/users/:id', async c => {
  const auth = getAuth(c);

  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

>>>>>>> c396df71e96c17c0aaaa9eb6650b5a952324be06:apps/svc-producers/src/routes/api.ts
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
<<<<<<< HEAD:apps/hono-backend/src/routes/api.ts
api.delete('/users/:id', (c) => {
=======
api.delete('/users/:id', c => {
  const auth = getAuth(c);

  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

>>>>>>> c396df71e96c17c0aaaa9eb6650b5a952324be06:apps/svc-producers/src/routes/api.ts
  const id = c.req.param('id');
  return c.json({
    message: 'User deleted successfully',
    id: parseInt(id),
    authenticatedUserId: auth.userId,
  });
});

// Protected route example
<<<<<<< HEAD:apps/hono-backend/src/routes/api.ts
api.get('/protected/profile', (c) => {
=======
api.get('/protected/profile', c => {
  const auth = getAuth(c);

  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

>>>>>>> c396df71e96c17c0aaaa9eb6650b5a952324be06:apps/svc-producers/src/routes/api.ts
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
