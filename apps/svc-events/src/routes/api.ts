import { Hono, Context } from 'hono';
import { events } from './events';
import { inviteRoutes } from './invite-codes';

const api = new Hono();

// Helper function to get JWT payload from context
function getJwtPayload(c: Context) {
  return c.get('jwtPayload');
}

api.route('/events', events);
api.route('/invite-codes', inviteRoutes);

// GET /api/users/:id
api.get('/users/:id', (c) => {
  const jwtPayload = getJwtPayload(c);

  if (!jwtPayload?.id) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = c.req.param('id');
  return c.json({
    id: parseInt(id),
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
    id: parseInt(id),
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
    id: parseInt(id),
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
