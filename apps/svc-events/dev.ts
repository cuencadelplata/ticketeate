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
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const [key, ...values] = line.split('=');
      return [key.trim(), values.join('=').trim()];
    }),
);

// Usar la variable del archivo .env directamente
const port = parseInt(envVars.PORT || '3001', 10);

// Exportar variables relevantes al entorno de ejecución (útil en dev)
process.env.NODE_ENV = envVars.NODE_ENV || process.env.NODE_ENV || 'development';
process.env.SERVICE_NAME = envVars.SERVICE_NAME || process.env.SERVICE_NAME || 'svc-events';
if (envVars.OTEL_EXPORTER_OTLP_ENDPOINT) {
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT = envVars.OTEL_EXPORTER_OTLP_ENDPOINT;
}

console.log(`🚀 Development server running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
