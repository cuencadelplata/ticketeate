import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { serve } from '@hono/node-server';
import app from './src/index.js';

// Obtener __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Leer y parsear el .env manualmente
const envPath = resolve(__dirname, '.env');
const envContent = readFileSync(envPath, 'utf-8');
const envVars = Object.fromEntries(
  envContent
    .split('\n')
    .filter(line => line && !line.startsWith('#') && line.includes('='))
    .map(line => {
      const [key, ...values] = line.split('=');
      return [key.trim(), values.join('=').trim()];
    })
);

// Usar la variable del archivo .env directamente
const port = parseInt(envVars.PORT || '3003', 10);

console.log(`🚀 Development server running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
