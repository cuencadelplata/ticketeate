import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { serve } from '@hono/node-server';

// Obtener __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Leer y parsear el .env manualmente ANTES de importar app
const envPath = resolve(__dirname, '.env');
const envContent = readFileSync(envPath, 'utf-8');
const envVars = Object.fromEntries(
  envContent
    .split('\n')
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const [key, ...values] = line.split('=');
      return [key.trim(), values.join('=').trim()];
    }),
);

// Inyectar variables de entorno ANTES de importar app
// Setear NODE_ENV a 'development' si no está definido
process.env.NODE_ENV = process.env.NODE_ENV || envVars.NODE_ENV || 'development';
Object.entries(envVars).forEach(([key, value]) => {
  if (!process.env[key]) {
    process.env[key] = value;
  }
});

console.log('[dev.ts] NODE_ENV:', process.env.NODE_ENV);
console.log('[dev.ts] CORS will be applied:', process.env.NODE_ENV !== 'production');

// Importar app DESPUÉS de setear las variables
import app from './src/index.js';

// Usar la variable del archivo .env directamente
const port = parseInt(process.env.PORT || '3002', 10);

console.log(`🚀 Development server running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
