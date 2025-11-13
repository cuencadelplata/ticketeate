import { z } from 'zod';

/**
 * Schema de validación para variables de entorno
 * Asegura que todas las variables requeridas estén presentes y tengan el formato correcto
 */
const envSchema = z.object({
  // Base de datos
  DATABASE_URL: z.string().url('DATABASE_URL debe ser una URL válida'),
  DIRECT_URL: z.string().url('DIRECT_URL debe ser una URL válida').optional(),

  // Autenticación
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, 'BETTER_AUTH_SECRET debe tener al menos 32 caracteres'),
  BETTER_AUTH_URL: z.string().url('BETTER_AUTH_URL debe ser una URL válida'),

  // APIs Externas
  RESEND_API_KEY: z
    .string()
    .startsWith('re_', 'RESEND_API_KEY debe comenzar con "re_"'),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME es requerido').optional(),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY es requerido').optional(),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET es requerido').optional(),

  // Redis
  REDIS_URL: z.string().url('REDIS_URL debe ser una URL válida').optional(),
  REDIS_PASSWORD: z.string().optional(),

  // MercadoPago
  MERCADOPAGO_ACCESS_TOKEN: z.string().optional(),

  // Entorno
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Frontend público (opcional para desarrollo)
  NEXT_PUBLIC_API_URL: z.string().url('NEXT_PUBLIC_API_URL debe ser una URL válida').optional(),
});

/**
 * Valida las variables de entorno al inicio de la aplicación
 * Lanza un error si alguna variable requerida falta o tiene formato incorrecto
 */
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err) => {
        return `  - ${err.path.join('.')}: ${err.message}`;
      });

      console.error('❌ Error de validación de variables de entorno:');
      console.error(missingVars.join('\n'));
      console.error('\n💡 Revisa tu archivo .env y asegúrate de tener todas las variables requeridas.');

      throw new Error('Variables de entorno inválidas o faltantes');
    }
    throw error;
  }
}

/**
 * Variables de entorno validadas y tipadas
 * Usar este objeto en lugar de process.env directamente
 */
export const env = validateEnv();

/**
 * Tipo de las variables de entorno validadas
 */
export type Env = z.infer<typeof envSchema>;
