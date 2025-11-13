# Paquete Shared - Utilidades Compartidas

Este paquete contiene utilidades compartidas entre todos los servicios de Ticketeate.

## 📦 Módulos Disponibles

### 1. Validación de Variables de Entorno (`env.ts`)

Valida que todas las variables de entorno requeridas estén presentes y tengan el formato correcto.

**Uso:**
```typescript
import { env, getAllowedOrigins } from '@repo/shared/env';

// Variables validadas y tipadas
const dbUrl = env.DATABASE_URL;
const authSecret = env.BETTER_AUTH_SECRET;

// Lista de orígenes permitidos para CORS
const allowedOrigins = getAllowedOrigins();
```

**Variables Validadas:**
- `DATABASE_URL` (required)
- `BETTER_AUTH_SECRET` (required, min 32 chars)
- `BETTER_AUTH_URL` (required)
- `RESEND_API_KEY` (required, starts with 're_')
- `NODE_ENV` (default: 'development')
- Y más... (ver archivo para lista completa)

---

### 2. Logger Estructurado (`logger.ts`)

Sistema de logging estructurado con niveles y formato JSON en producción.

**Uso:**
```typescript
import { logger } from '@repo/shared/logger';

// Info general
logger.info('Usuario creado', { userId: 123, email: 'user@example.com' });

// Advertencias
logger.warn('Límite de intentos alcanzado', { ip: '192.168.1.1' });

// Errores con contexto
logger.error('Error al procesar pago', error, {
  orderId: 456,
  amount: 1000,
  userId: 789,
});

// Debug (solo en desarrollo)
logger.debug('Estado de la sesión', { sessionData });

// HTTP requests
logger.http('POST', '/api/events', 201, 150);
```

**Niveles:**
- `debug`: Solo en desarrollo
- `info`: Información general
- `warn`: Advertencias
- `error`: Errores

**Características:**
- ✅ Timestamps automáticos
- ✅ Formato JSON en producción
- ✅ Colores en desarrollo
- ✅ Stack traces incluidos en errores
- ✅ No expone información sensible

---

### 3. Rate Limiting (`rate-limit.ts`)

Middleware de rate limiting para prevenir abuso de APIs.

**Uso Básico:**
```typescript
import { rateLimiter } from '@repo/shared/rate-limit';

// Rate limiting general
app.use('*', rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 100, // máximo 100 requests
  message: 'Too many requests, please try again later.',
}));
```

**Variantes Predefinidas:**

#### API Pública (60 req/min)
```typescript
import { apiRateLimiter } from '@repo/shared/rate-limit';

app.use('/api/*', apiRateLimiter());
```

#### Endpoints Sensibles (5 req/15min)
```typescript
import { strictRateLimiter } from '@repo/shared/rate-limit';

app.post('/api/auth/login', strictRateLimiter(), async (c) => {
  // Solo 5 intentos cada 15 minutos
});
```

#### Personalizado
```typescript
import { rateLimiter } from '@repo/shared/rate-limit';

app.use('/api/checkout/*', rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hora
  limit: 10, // máximo 10 checkouts por hora
  keyGenerator: (c) => {
    // Usar user ID en lugar de IP
    return c.get('userId') || c.req.header('x-forwarded-for') || 'unknown';
  },
}));
```

**Headers de Respuesta:**
- `X-RateLimit-Limit`: Límite total
- `X-RateLimit-Remaining`: Requests restantes
- `X-RateLimit-Reset`: Timestamp de reseteo
- `Retry-After`: Segundos hasta el próximo intento (si excedido)

**Notas:**
- ⚠️ Store en memoria (considerar Redis para producción)
- ⚠️ Limpieza automática cada 60 segundos
- ⚠️ No compartido entre instancias sin Redis

---

### 4. Redis Client (`redis.ts`)

Cliente de Redis configurado para el proyecto.

**Uso:**
```typescript
import { getRedisClient } from '@repo/shared/redis';

const redis = getRedisClient();
await redis.set('key', 'value');
const value = await redis.get('key');
```

---

## 🔧 Configuración

### Instalación en un Nuevo Servicio

1. El paquete ya está configurado como workspace en `pnpm-workspace.yaml`
2. Simplemente importar desde `@repo/shared/[modulo]`

### TypeScript

Los tipos están incluidos en cada archivo. No se requiere configuración adicional.

### Variables de Entorno

Configurar en `.env`:
```env
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="http://localhost:3000"
RESEND_API_KEY="re_..."
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"
```

---

## 📋 Ejemplos Completos

### Microservicio Hono con Todas las Utilidades

```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';
import { logger } from '@repo/shared/logger';
import { getAllowedOrigins } from '@repo/shared/env';
import { apiRateLimiter, strictRateLimiter } from '@repo/shared/rate-limit';

const app = new Hono();

// Logger de HTTP
app.use('*', honoLogger());

// Rate limiting general
app.use('*', apiRateLimiter());

// CORS seguro
app.use('*', cors({
  origin: (origin) => {
    const allowedOrigins = getAllowedOrigins();
    if (!origin) return allowedOrigins[0];
    return allowedOrigins.includes(origin) ? origin : null;
  },
  credentials: true,
}));

// Rutas
app.get('/health', (c) => {
  logger.info('Health check');
  return c.json({ status: 'healthy' });
});

// Endpoint sensible con rate limiting estricto
app.post('/auth/login', strictRateLimiter(), async (c) => {
  try {
    // ... lógica de login
    logger.info('Login exitoso', { userId: 123 });
    return c.json({ success: true });
  } catch (error) {
    logger.error('Error en login', error, { ip: c.req.header('x-forwarded-for') });
    return c.json({ error: 'Login failed' }, 401);
  }
});

// Error handler global
app.onError((err, c) => {
  logger.error('Application error', err, {
    path: c.req.path,
    method: c.req.method,
  });
  return c.json({ error: 'Internal Server Error' }, 500);
});

export default app;
```

---

## 🧪 Testing

Para testear los módulos:

```typescript
// Test de validación de env
import { env } from '@repo/shared/env';
console.log(env.DATABASE_URL); // Debe ser válido o lanzar error

// Test de logger
import { logger } from '@repo/shared/logger';
logger.info('Test message', { data: 'test' });

// Test de rate limiting
// Hacer 61 requests en 1 minuto, la 61 debe fallar con 429
```

---

## 🔒 Seguridad

### Mejores Prácticas

1. **Siempre usar el logger**, nunca `console.log` directamente
2. **Validar env al inicio** de cada aplicación
3. **Aplicar rate limiting** en todos los endpoints públicos
4. **CORS estricto** en producción
5. **Revisar logs** regularmente en busca de patrones anómalos

### Información Sensible

El logger automáticamente:
- ❌ No registra contraseñas
- ❌ No registra tokens completos
- ✅ Registra solo mensajes de error, no detalles de usuario
- ✅ Stack traces solo en desarrollo

Para datos sensibles:
```typescript
// ❌ MAL
logger.info('User login', { password: '123456' });

// ✅ BIEN
logger.info('User login', { userId: 123, email: 'user@...com' });
```

---

## 📚 Referencias

- [Zod Documentation](https://zod.dev/)
- [Hono Documentation](https://hono.dev/)
- [Rate Limiting Best Practices](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)

---

## 🤝 Contribuir

Para agregar nuevas utilidades:

1. Crear archivo en `packages/shared/`
2. Exportar funciones/clases públicas
3. Documentar en este README
4. Agregar tests si aplica
5. Usar en al menos un servicio antes de considerar "estable"

---

**Última actualización:** 2025-11-13  
**Versión:** 1.0.0
