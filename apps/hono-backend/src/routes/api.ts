import { Hono } from 'hono';

const api = new Hono();

api.get('/users', c => {
  return c.json({
    users: [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    ],
  });
});

api.post('/users', async c => {
  const body = await c.req.json();
  return c.json(
    {
      message: 'User created successfully',
      user: body,
    },
    201
  );
});

api.get('/users/:id', c => {
  const id = c.req.param('id');
  return c.json({
    id: parseInt(id, 10),
    name: 'John Doe',
    email: 'john@example.com',
  });
});

api.put('/users/:id', async c => {
  const id = c.req.param('id');
  const body = await c.req.json();
  return c.json({
    message: 'User updated successfully',
    id: parseInt(id, 10),
    user: body,
  });
});

api.delete('/users/:id', c => {
  const id = c.req.param('id');
  return c.json({
    message: 'User deleted successfully',
    id: parseInt(id, 10),
  });
});

api.use('/protected/*', async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
});

api.get('/protected/profile', c => {
  return c.json({
    message: 'This is a protected route',
    user: {
      id: 1,
      name: 'John Doe',
      role: 'admin',
    },
  });
});

export { api as apiRoutes };
