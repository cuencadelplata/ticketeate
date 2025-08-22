# Express.js Backend

Un servidor backend robusto construido con Express.js y TypeScript para el turborepo.

## 🚀 Características

- **Express.js** - Framework web rápido y minimalista para Node.js
- **TypeScript** - Tipado estático para JavaScript
- **CORS** - Soporte para Cross-Origin Resource Sharing
- **Helmet** - Seguridad HTTP con headers apropiados
- **Morgan** - Logging de requests HTTP
- **ESLint** - Linting de código con reglas personalizadas
- **Hot Reload** - Desarrollo con recarga automática usando tsx

## 📁 Estructura del Proyecto

```
src/
├── index.ts          # Punto de entrada principal
├── routes/           # Definición de rutas
│   ├── api.ts        # Rutas de la API
│   └── health.ts     # Rutas de health check
└── types/            # Definiciones de tipos TypeScript
    └── index.ts      # Tipos principales
```

## 🛠️ Scripts Disponibles

- `pnpm dev` - Inicia el servidor en modo desarrollo con hot reload
- `pnpm build` - Compila el proyecto TypeScript a JavaScript
- `pnpm start` - Inicia el servidor compilado
- `pnpm clean` - Limpia la carpeta de build
- `pnpm lint` - Ejecuta ESLint para verificar el código
- `pnpm lint:fix` - Corrige automáticamente los errores de linting

## 🚀 Inicio Rápido

1. **Instalar dependencias:**

   ```bash
   pnpm install
   ```

2. **Configurar variables de entorno:**

   ```bash
   cp env.example .env
   # Editar .env con tus configuraciones
   ```

3. **Ejecutar en desarrollo:**

   ```bash
   pnpm dev
   ```

4. **Construir para producción:**
   ```bash
   pnpm build
   pnpm start
   ```

## 🌐 Endpoints Disponibles

### Health Check

- `GET /health` - Estado del servicio
- `GET /health/ping` - Ping simple

### API

- `GET /api` - Información de la API
- `GET /api/users` - Lista de usuarios
- `GET /api/posts` - Lista de posts
- `POST /api/users` - Crear nuevo usuario

### Root

- `GET /` - Información del servidor

## 🔧 Configuración

### Variables de Entorno

- `PORT` - Puerto del servidor (default: 3001)
- `NODE_ENV` - Entorno de ejecución (development/production)

### TypeScript

El proyecto está configurado para usar la configuración base del turborepo con ajustes específicos para Node.js y CommonJS.

### ESLint

Extiende la configuración base del turborepo con reglas específicas para TypeScript y Express.js.

## 📦 Dependencias

### Producción

- `express` - Framework web
- `cors` - Middleware CORS
- `helmet` - Seguridad HTTP
- `morgan` - Logging HTTP
- `dotenv` - Variables de entorno

### Desarrollo

- `typescript` - Compilador TypeScript
- `tsx` - Ejecutor TypeScript con hot reload
- `@types/*` - Tipos para librerías
- `eslint` - Linting de código

## 🔮 Próximas Mejoras

- [ ] Middleware de autenticación JWT
- [ ] Conexión a base de datos
- [ ] Validación de datos con Joi/Zod
- [ ] Tests unitarios y de integración
- [ ] Documentación de API con Swagger
- [ ] Rate limiting
- [ ] Compresión de respuestas
- [ ] Cache con Redis

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](../../LICENSE) para más detalles.
