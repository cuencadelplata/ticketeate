import { Router, Request, Response } from 'express';

export const router = Router();

// Example API endpoints
router.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to the API',
    version: '1.0.0',
    endpoints: {
      users: '/users',
      posts: '/posts',
      health: '/health',
    },
  });
});

// Users endpoint
router.get('/users', (req: Request, res: Response) => {
  res.json({
    users: [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    ],
  });
});

// Posts endpoint
router.get('/posts', (req: Request, res: Response) => {
  res.json({
    posts: [
      { id: 1, title: 'First Post', content: 'This is the first post' },
      { id: 2, title: 'Second Post', content: 'This is the second post' },
    ],
  });
});

// Example POST endpoint
router.post('/users', (req: Request, res: Response) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      error: 'Name and email are required',
    });
  }

  res.status(201).json({
    message: 'User created successfully',
    user: { id: Date.now(), name, email },
  });
});
