# Guía para Configurar Google OAuth

Esta guía te ayudará a crear las credenciales de Google OAuth para habilitar el inicio de sesión con Google en tu aplicación.

## 📋 Requisitos Previos

- Una cuenta de Google
- Acceso a Google Cloud Console

## 🚀 Pasos para Configurar Google OAuth

### Paso 1: Crear un Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en el selector de proyectos (arriba a la izquierda)
4. Haz clic en **"NUEVO PROYECTO"**
5. Ingresa un nombre para tu proyecto (ej: "Ticketeate OAuth")
6. Haz clic en **"CREAR"**

### Paso 2: Configurar la Pantalla de Consentimiento OAuth

1. En el menú lateral, ve a **"APIs y servicios"** > **"Pantalla de consentimiento OAuth"**
2. Selecciona **"Externo"** y haz clic en **"CREAR"**
3. Completa la información:
   - **Nombre de la app**: Ticketeate (o el nombre que prefieras)
   - **Email de soporte**: Tu email
   - **Logo** (opcional): Puedes subir un logo para tu app
   - **Dominio del desarrollador** (opcional): Deja en blanco por ahora
   - **Email de contacto del desarrollador**: Tu email
4. Haz clic en **"GUARDAR Y CONTINUAR"**

#### Configurar Scopes (Ámbitos)

1. En la sección **"Scopes"**, haz clic en **"AGREGAR O QUITAR SCOPES"**
2. Busca y selecciona los siguientes scopes:
   - `email`
   - `profile`
   - `openid`
3. Haz clic en **"ACTUALIZAR"** y luego en **"GUARDAR Y CONTINUAR"**

#### Agregar Usuarios de Prueba

1. En la sección **"Usuarios de prueba"**, haz clic en **"+ AGREGAR USUARIOS"**
2. Agrega tu email (y cualquier otro email que quieras permitir durante las pruebas)
3. Haz clic en **"AGREGAR"**
4. Haz clic en **"GUARDAR Y CONTINUAR"**

### Paso 3: Crear las Credenciales OAuth 2.0

1. En el menú lateral, ve a **"APIs y servicios"** > **"Credenciales"**
2. Haz clic en **"+ CREAR CREDENCIALES"** > **"ID de cliente de OAuth"**
3. Si es la primera vez, se te pedirá configurar la pantalla de consentimiento (ya lo hiciste en el paso anterior)
4. Completa el formulario:
   - **Tipo de aplicación**: Selecciona **"Aplicación web"**
   - **Nombre**: Ticketeate Web Client (o el nombre que prefieras)

#### Configurar Orígenes JavaScript Autorizados

Agrega los siguientes orígenes (uno por línea):

```
http://localhost:3000
https://tu-dominio.com
```

**Nota**: Reemplaza `tu-dominio.com` con tu dominio de producción cuando lo tengas.

#### Configurar URI de Redirección Autorizados

Agrega las siguientes URIs (una por línea):

```
http://localhost:3000/api/auth/callback/google
https://tu-dominio.com/api/auth/callback/google
```

**Nota**: 
- Para desarrollo local: `http://localhost:3000/api/auth/callback/google`
- Para producción: `https://tu-dominio.com/api/auth/callback/google`

5. Haz clic en **"CREAR"**

### Paso 4: Obtener las Credenciales

Después de crear el ID de cliente, verás una ventana con:
- **ID de cliente**: Copia este valor (será tu `GOOGLE_CLIENT_ID`)
- **Secreto de cliente**: Copia este valor (será tu `GOOGLE_CLIENT_SECRET`)

⚠️ **IMPORTANTE**: Guarda el secreto de cliente de forma segura. Solo se muestra una vez.

### Paso 5: Configurar las Variables de Entorno

1. Abre el archivo `.env.local` en la carpeta `apps/next-frontend/`
2. Si no existe, créalo basándote en `env.example`
3. Agrega las siguientes variables:

```env
GOOGLE_CLIENT_ID=tu-client-id-aqui.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret-aqui
```

**Ejemplo**:
```env
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
```

### Paso 6: Reiniciar el Servidor

1. Detén el servidor de desarrollo (Ctrl+C)
2. Reinicia el servidor:
   ```bash
   pnpm dev
   ```

### Paso 7: Verificar la Configuración

1. Ve a tu aplicación en `http://localhost:3000`
2. Intenta iniciar sesión
3. Deberías ver el botón **"Continuar con Google"**
4. Al hacer clic, deberías ser redirigido a Google para autorizar la aplicación

## 🔒 Configuración para Producción

Cuando despliegues tu aplicación en producción:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Ve a **"APIs y servicios"** > **"Credenciales"**
3. Haz clic en tu ID de cliente OAuth
4. Agrega tu dominio de producción en:
   - **Orígenes JavaScript autorizados**: `https://tu-dominio.com`
   - **URI de redirección autorizados**: `https://tu-dominio.com/api/auth/callback/google`
5. Actualiza las variables de entorno en tu servidor de producción con las mismas credenciales

## ⚠️ Notas Importantes

- **No compartas tus credenciales**: Nunca subas `GOOGLE_CLIENT_SECRET` a repositorios públicos
- **Verificación de la aplicación**: Si tu aplicación está en modo de prueba, solo los usuarios agregados como "usuarios de prueba" podrán iniciar sesión
- **Límites de cuota**: Google tiene límites en el número de solicitudes OAuth. Para producción, es posible que necesites solicitar un aumento de cuota

## 🐛 Solución de Problemas

### Error: "redirect_uri_mismatch"
- Verifica que la URI de redirección en Google Cloud Console coincida exactamente con la URL de tu aplicación
- Asegúrate de incluir el protocolo (`http://` o `https://`)
- Verifica que no haya espacios adicionales

### Error: "invalid_client"
- Verifica que `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` estén correctamente configurados en `.env.local`
- Asegúrate de haber reiniciado el servidor después de agregar las variables

### El botón de Google no aparece
- Verifica que las variables de entorno estén configuradas correctamente
- Revisa la consola del navegador para ver si hay errores
- Verifica que el servidor se haya reiniciado después de configurar las variables

## 📚 Recursos Adicionales

- [Documentación de Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Better Auth - Social Providers](https://better-auth.com/docs/guides/social-providers)
- [Google Cloud Console](https://console.cloud.google.com/)

## ✅ Checklist

- [ ] Proyecto creado en Google Cloud Console
- [ ] Pantalla de consentimiento OAuth configurada
- [ ] Scopes configurados (email, profile, openid)
- [ ] Usuarios de prueba agregados
- [ ] ID de cliente OAuth creado
- [ ] Orígenes JavaScript autorizados configurados
- [ ] URIs de redirección autorizados configurados
- [ ] Variables de entorno configuradas en `.env.local`
- [ ] Servidor reiniciado
- [ ] Botón de Google aparece en la página de inicio de sesión
- [ ] Inicio de sesión con Google funciona correctamente

¡Listo! Ya tienes Google OAuth configurado en tu aplicación. 🎉

