import { config } from 'dotenv';
import { serve } from '@hono/node-server';
import app from './src/index.js';

// Cargar variables de entorno
config();

const port = process.env.PORT ? parseInt(process.env.PORT) : 3002;

console.log(`🚀 Development server running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
