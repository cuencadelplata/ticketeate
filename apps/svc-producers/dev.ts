import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { serve } from '@hono/node-server';

// Obtener __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Leer y parsear el .env manualmente
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

// Propagar variables de .env a process.env (sin sobreescribir existentes)
for (const [key, value] of Object.entries(envVars)) {
  if (typeof process.env[key] === 'undefined') {
    process.env[key] = value;
  }
}

// Usar la variable del archivo .env directamente
const port = parseInt(process.env.PORT || envVars.PORT || '3004', 10);

console.log(`🚀 Development server running on http://localhost:${port}`);

// Importar la app después de configurar process.env para asegurar que Prisma tenga acceso a DATABASE_URL
// Evitar top-level await en CJS usando un IIFE async
(async () => {
  const { default: app } = await import('./src/index.js');
  serve({ fetch: app.fetch, port });
})().catch((err) => {
  console.error('Failed to start svc-producers dev server:', err);
  process.exit(1);
});
