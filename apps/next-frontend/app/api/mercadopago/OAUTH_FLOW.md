# Flujo OAuth 2.0 - Mercado Pago Wallet Integration

## Descripción General

Este directorio contiene la implementación completa del flujo OAuth 2.0 de Mercado Pago para vincular billeteras de organizadores. Sigue las mejores prácticas de seguridad incluyendo PKCE (Proof Key for Code Exchange) y validación CSRF.

## Endpoints

### 1. GET `/api/mercadopago/auth`
**Propósito**: Inicia el flujo OAuth redirigiendo al usuario a Mercado Pago

**Flujo**:
1. Valida que el usuario esté autenticado
2. Genera valores PKCE (code_verifier y code_challenge)
3. Genera un state aleatorio para protección CSRF
4. Almacena estos valores en cookies httpOnly
5. Redirige a `https://auth.mercadopago.com/authorization` con los parámetros

**Parámetros en cookies** (httpOnly, secure, sameSite=lax):
- `oauth_code_verifier`: Para PKCE (válido 10 min)
- `oauth_state`: Para validación CSRF (válido 10 min)
- `oauth_user_id`: ID del usuario (válido 10 min)

**Configuración requerida**:
- `MERCADO_PAGO_CLIENT_ID`
- `MERCADO_PAGO_REDIRECT_URI`

---

### 2. GET `/api/mercadopago/callback`
**Propósito**: Callback de Mercado Pago después de que el usuario autoriza

**Flujo**:
1. Recibe `code`, `state` y posibles errores de Mercado Pago
2. Valida que el `state` coincida (protección CSRF)
3. Valida que exista el `code_verifier` (PKCE)
4. Intercambia el `code` por `access_token` y `refresh_token` usando POST a `/oauth/token`
5. Calcula la fecha de expiración del token
6. Actualiza el usuario en la BD con:
   - `wallet_linked: true`
   - `wallet_provider: 'mercado_pago'`
   - `mercado_pago_user_id`
   - `mercado_pago_access_token`
   - `mercado_pago_refresh_token`
   - `mercado_pago_token_expires_at`
7. Limpia las cookies de OAuth
8. Redirige a `/configuracion?success=wallet_linked`

**Manejo de errores**:
- `oauth_error`: El usuario canceló o error en Mercado Pago
- `missing_params`: Faltan `code` o `state`
- `invalid_state`: State no coincide (intento CSRF)
- `invalid_pkce`: No se encontró el code_verifier
- `invalid_session`: No se encontró el user_id
- `token_error`: Error al intercambiar el código
- `db_error`: Error actualizando la BD
- `callback_error`: Error general

---

### 3. POST `/api/mercadopago/refresh-token`
**Propósito**: Renueva el access token cuando está próximo a expirar

**Requisitos**:
- Usuario autenticado (via session)
- Usuario con billetera vinculada

**Flujo**:
1. Valida que el usuario esté autenticado
2. Obtiene el `refresh_token` y `token_expires_at` del usuario
3. Si el token aún es válido por más de 5 minutos, retorna 200 sin renovar
4. Si necesita renovación, hace POST a `/oauth/token` con:
   ```json
   {
     "client_id": "TU_CLIENT_ID",
     "client_secret": "TU_CLIENT_SECRET",
     "grant_type": "refresh_token",
     "refresh_token": "REFRESH_TOKEN_DEL_USUARIO"
   }
   ```
5. Si la renovación falla, desvincula automáticamente la billetera
6. Actualiza `mercado_pago_access_token` y `mercado_pago_token_expires_at`

**Respuesta exitosa**:
```json
{
  "message": "Token renewed successfully",
  "expiresIn": 21600,
  "expiresAt": "2025-11-16T22:54:23.250Z"
}
```

---

### 4. GET `/api/mercadopago/app-token`
**Propósito**: Obtiene un token de aplicación (Client Credentials) para acceder a recursos propios

**Requisitos**:
- Header `Authorization: Bearer <SERVICE_AUTH_SECRET>`
- Solo para llamadas backend-to-backend

**Flujo**:
1. Valida el header `Authorization` contra `SERVICE_AUTH_SECRET`
2. Hace POST a `/oauth/token` con:
   ```json
   {
     "client_id": "TU_CLIENT_ID",
     "client_secret": "TU_CLIENT_SECRET",
     "grant_type": "client_credentials"
   }
   ```
3. Retorna el `access_token` válido por 6 horas

**Respuesta**:
```json
{
  "access_token": "...",
  "token_type": "Bearer",
  "expires_in": 21600
}
```

---

## Configuración de Variables de Entorno

Necesitas agregar estas variables a `.env.production` y a AWS Parameter Store:

```env
# OAuth Client
MERCADO_PAGO_CLIENT_ID=3732099650951629
MERCADO_PAGO_CLIENT_SECRET=4wOupBR7FfON4hMaeTFknhgl8Ek8HzDl

# OAuth Redirect
MERCADO_PAGO_REDIRECT_URI=https://ticketeate.com.ar/api/mercadopago/callback

# Public/Access keys para transacciones
MERCADO_PAGO_PUBLIC=APP_USR-90014d20-cfa7-4d1f-98e0-c7d711c11cbd
MERCADO_PAGO_ACCESS=APP_USR-3732099650951629-111615-0406440670ca1fd52796bcd0a3fcc472-654204932

# Webhook secret
MERCADOPAGO_WEBHOOK_SECRET=eab284282db11b375f647db5bd085f0311fde636f9cb3c26bb972b8a83b70df3

# Service-to-service authentication
SERVICE_AUTH_SECRET=Rdc5eubq2wLLhAGidGb7Y43GuqXHfXEi-SERVICE-SECRET

# Mock mode (set to false en producción)
MERCADO_PAGO_MOCK=false
```

**Nota**: En producción, estas variables deben estar:
1. En AWS Parameter Store bajo `/ticketeate/production/`
2. Las variables con `MERCADO_PAGO_` deben ser mapeadas por el workflow de GitHub Actions
3. No deben estar expuestas en el repositorio

---

## Flujo de Seguridad

### PKCE (Proof Key for Code Exchange)
- **¿Por qué?** Protege contra ataques de code interception
- **¿Cómo?** El cliente genera un `code_verifier` aleatorio (128 caracteres) y computa su SHA-256 (`code_challenge`)
- **Implementación**:
  1. En `/auth`: se genera y almacena en cookie
  2. En `/callback`: se usa para intercambiar el código

### CSRF Protection (State)
- **¿Por qué?** Protege contra ataques cross-site request forgery
- **¿Cómo?** Se genera un `state` aleatorio, se almacena y se valida en el callback
- **Implementación**:
  1. En `/auth`: se genera y almacena en cookie
  2. En `/callback`: se compara con el parámetro `state` de la URL

### Cookies HttpOnly
- **¿Por qué?** Previene acceso a tokens desde JavaScript (mitigación XSS)
- **¿Cómo?** Se usan cookies httpOnly para almacenar temporalmente valores de OAuth
- **Parámetros**: `secure=true` (HTTPS), `sameSite=lax`, `maxAge=600` (10 min)

---

## Almacenamiento de Tokens en Base de Datos

Los tokens se guardan en el modelo `User`:

```prisma
model User {
  // ... otros campos
  wallet_linked: Boolean @default(false)
  wallet_provider: String? // 'mercado_pago'
  mercado_pago_user_id: String? @unique
  mercado_pago_access_token: String? // Encriptado
  mercado_pago_refresh_token: String? // Encriptado
  mercado_pago_token_expires_at: DateTime?
}
```

**Importante**: Estos tokens deben estar encriptados en la BD (usar triggers o middleware).

---

## Manejo de Errores

### Errores de Mercado Pago
| Error | Descripción | Acción |
|-------|-------------|--------|
| `access_denied` | Usuario canceló | Mostrar notificación amigable |
| `invalid_scope` | Permisos inválidos | Revisar configuración |
| `server_error` | Error en MP | Reintentar |
| `temporarily_unavailable` | MP caído | Reintentar después |

### Errores de Token
| Error | Descripción | Acción |
|-------|-------------|--------|
| `invalid_state` | Intento CSRF | Rechazar y loguear |
| `invalid_pkce` | PKCE faltante | Rechazar y loguear |
| `token_error` | Intercambio falló | Reintentar |
| `REFRESH_FAILED` | Refresh expired | Desvincular billetera |

---

## Flujo Completo de Usuario

```
1. Usuario en /configuracion ve botón "Vincular Mercado Pago"
   ↓
2. Click → GET /api/mercadopago/auth
   ↓
3. Redirect a https://auth.mercadopago.com/authorization?...
   ↓
4. Usuario ingresa credenciales en Mercado Pago
   ↓
5. Usuario acepta permisos
   ↓
6. Redirect a /api/mercadopago/callback?code=...&state=...
   ↓
7. Backend intercambia código por tokens
   ↓
8. Guardar tokens en BD
   ↓
9. Redirect a /configuracion?success=wallet_linked
   ↓
10. UI muestra "Billetera vinculada" ✓
```

---

## Testing

### En Desarrollo (Mock Mode)
```env
MERCADO_PAGO_MOCK=true
```

Esto redirige a `/api/mercadopago/mock-callback` para testing sin usar credenciales reales.

### En Producción
- Usar credenciales reales
- Garantizar HTTPS
- Validar que todos los secrets estén en Parameter Store
- Monitorear logs en CloudWatch

---

## Referencias

- [Documentación Oficial Mercado Pago OAuth](https://developers.mercadopago.com/es/docs/advanced-payments/oauth)
- [RFC 7636 - PKCE](https://tools.ietf.org/html/rfc7636)
- [OWASP - OAuth 2.0 Security](https://cheatsheetseries.owasp.org/cheatsheets/OAuth_2_Cheat_Sheet.html)
