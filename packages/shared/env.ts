import { z } from 'zod';

/**
 * Schema de validación para variables de entorno del servidor
 * Asegura que todas las variables críticas estén presentes y tengan el formato correcto
 */
const serverEnvSchema = z.object({
  // Base de datos
  DATABASE_URL: z.string().url('DATABASE_URL debe ser una URL válida'),
  DIRECT_URL: z.string().url('DIRECT_URL debe ser una URL válida').optional(),

  // Autenticación
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, 'BETTER_AUTH_SECRET debe tener al menos 32 caracteres'),
  BETTER_AUTH_URL: z.string().url('BETTER_AUTH_URL debe ser una URL válida'),

  // APIs Externas
  RESEND_API_KEY: z.string().startsWith('re_', 'RESEND_API_KEY debe comenzar con re_'),

  // Configuración del servidor
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/, 'PORT debe ser un número').optional(),

  // Redis (opcional en desarrollo)
  REDIS_URL: z.string().url('REDIS_URL debe ser una URL válida').optional(),
  REDIS_PASSWORD: z.string().optional(),
});

/**
 * Schema de validación para variables de entorno opcionales/servicios adicionales
 */
const optionalEnvSchema = z.object({
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // MercadoPago
  MERCADOPAGO_ACCESS_TOKEN: z.string().optional(),
  MERCADOPAGO_PUBLIC_KEY: z.string().optional(),

  // GitHub
  GITHUB_TOKEN: z.string().optional(),
  GITHUB_OWNER: z.string().optional(),
  GITHUB_REPO: z.string().optional(),

  // URLs públicas del frontend
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  NEXT_PUBLIC_EVENTS_API_URL: z.string().url().optional(),

  // CORS
  ALLOWED_ORIGINS: z.string().optional(),
});

/**
 * Schema combinado para todas las variables de entorno
 */
const envSchema = serverEnvSchema.merge(optionalEnvSchema);

export type Env = z.infer<typeof envSchema>;

/**
 * Valida las variables de entorno del proceso
 * @throws {z.ZodError} Si alguna variable requerida falta o tiene formato incorrecto
 */
export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Error en la validación de variables de entorno:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      console.error('\n💡 Revisa tu archivo .env y compáralo con .env.example');
      process.exit(1);
    }
    throw error;
  }
}

/**
 * Variables de entorno validadas
 * Se validan automáticamente al importar este módulo
 */
export const env = validateEnv();

/**
 * Helper para obtener los orígenes permitidos para CORS
 */
export function getAllowedOrigins(): string[] {
  const defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
  ];

  if (env.ALLOWED_ORIGINS) {
    return env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
  }

  if (env.NODE_ENV === 'production') {
    // En producción, solo permitir orígenes específicos
    return [
      'https://ticketeate.com.ar',
      'https://www.ticketeate.com.ar',
    ];
  }

  return defaultOrigins;
}
