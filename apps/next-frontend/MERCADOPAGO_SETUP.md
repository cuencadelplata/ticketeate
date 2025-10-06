# Configuración de Mercado Pago OAuth

Este documento explica cómo configurar la integración de OAuth de Mercado Pago para vincular billeteras de usuarios.

## 1. Crear una aplicación en Mercado Pago

1. Ve al [Panel de Desarrollador de Mercado Pago](https://www.mercadopago.com.ar/developers/panel/app)
2. Haz clic en "Crear aplicación"
3. Completa los campos requeridos:
   - **Nombre**: Nombre de tu aplicación
   - **Tipo de integración**: Selecciona "OAuth"
   - **Descripción**: Descripción de tu aplicación
4. Una vez creada, obtendrás las credenciales necesarias:
   - **Client ID** (Público)
   - **Client Secret** (Privado)

## 2. Configurar variables de entorno

Agrega las siguientes variables a tu archivo `.env.local`:

```env
# Mercado Pago OAuth
MERCADOPAGO_CLIENT_ID=tu-client-id-aqui
MERCADOPAGO_CLIENT_SECRET=tu-client-secret-aqui
NEXT_PUBLIC_MERCADOPAGO_CLIENT_ID=tu-client-id-aqui
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 3. Configurar Redirect URI

En el panel de Mercado Pago, configura la siguiente URL de redirección:
```
http://localhost:3000/api/auth/mercadopago/callback
```

Para producción, reemplaza `localhost:3000` con tu dominio.

## 4. Ejecutar migración de base de datos

Después de agregar los campos de Mercado Pago al esquema de Prisma, ejecuta:

```bash
# Generar el cliente de Prisma
pnpm db:generate

# Aplicar las migraciones
pnpm db:push
```

## 5. Funcionalidades implementadas

### Página de Perfil (`/profile`)
- Muestra información del usuario
- Botón para conectar/desconectar billetera de Mercado Pago
- Estado de conexión en tiempo real
- Manejo de errores y mensajes de éxito

### API Endpoints

#### `GET /api/auth/mercadopago/status`
Verifica si el usuario tiene Mercado Pago conectado.

#### `GET /api/auth/mercadopago/callback`
Maneja el callback de OAuth de Mercado Pago.

#### `POST /api/auth/mercadopago/disconnect`
Desconecta la billetera de Mercado Pago del usuario.

## 6. Flujo de OAuth

1. Usuario hace clic en "Conectar con Mercado Pago"
2. Se genera un state aleatorio para seguridad CSRF
3. Usuario es redirigido a Mercado Pago para autorizar
4. Mercado Pago redirige de vuelta con un código de autorización
5. El servidor intercambia el código por un access token
6. Se obtiene información del usuario de Mercado Pago
7. Se guarda toda la información en la base de datos
8. Usuario es redirigido a `/profile` con mensaje de éxito

## 7. Seguridad

- **State CSRF**: Se genera un state aleatorio para prevenir ataques CSRF
- **Tokens seguros**: Los tokens se almacenan en la base de datos de forma segura
- **Expiración**: Los tokens tienen fecha de expiración
- **Validación**: Se valida el estado de conexión antes de mostrar opciones

## 8. Campos agregados a la base de datos

```sql
-- Campos agregados al modelo user
mercadoPagoUserId        String?   -- ID del usuario en Mercado Pago
mercadoPagoAccessToken   String?   -- Token de acceso
mercadoPagoRefreshToken  String?   -- Token de renovación
mercadoPagoTokenExpiresAt DateTime? -- Fecha de expiración del token
mercadoPagoUserInfo      String?   -- Información del usuario (JSON)
```

## 9. Uso en el frontend

```tsx
// Verificar si el usuario tiene Mercado Pago conectado
const response = await fetch('/api/auth/mercadopago/status');
const { connected, userInfo } = await response.json();

// Conectar billetera
const handleConnect = () => {
  // Redirige a Mercado Pago OAuth
  window.location.href = '/api/auth/mercadopago/connect';
};

// Desconectar billetera
const handleDisconnect = async () => {
  await fetch('/api/auth/mercadopago/disconnect', { method: 'POST' });
};
```

## 10. Próximos pasos

- [ ] Implementar renovación automática de tokens
- [ ] Agregar webhooks de Mercado Pago
- [ ] Implementar pagos usando la billetera conectada
- [ ] Agregar historial de transacciones
- [ ] Implementar notificaciones de pago
