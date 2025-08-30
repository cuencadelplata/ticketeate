import { serve } from '@hono/node-server';
import app from './src/index.js';

const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;

console.log(`🚀 Development server running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
