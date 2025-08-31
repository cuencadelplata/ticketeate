# Panel de Administración - Ticketeate

## Descripción

Se ha creado un panel de administración completo para Ticketeate que incluye estadísticas, métricas y análisis del sistema. Este panel está integrado en la ruta `/deploys` existente y no modifica ninguna funcionalidad previa.

## Características

### 📊 **Resumen General**
- Total de eventos, usuarios, reservas e ingresos
- Estadísticas de los últimos 30 días
- Métricas de eventos activos vs. completados
- Tasa de confirmación de reservas

### 📅 **Estadísticas de Eventos**
- Lista detallada de todos los eventos
- Métricas de ocupación y stock
- Precios promedio por evento
- Estado y fechas de creación

### 👥 **Estadísticas de Usuarios**
- Total de usuarios activos e inactivos
- Distribución por roles (admin, usuario, moderador)
- Usuarios más activos (con más reservas)
- Nuevos registros del último mes

### 💰 **Análisis de Ingresos**
- Ingresos totales, confirmados y pendientes
- Distribución por estado de pago
- Análisis por método de pago
- Pagos más altos del sistema

### 📈 **Métricas de Rendimiento**
- Promedio de reservas por evento
- Tasa de conversión de reservas
- Precio promedio de entradas
- Ranking de eventos con mejor rendimiento
- Recomendaciones automáticas

## Instalación y Configuración

### Backend (Hono)

1. **Verificar que las rutas estén activas:**
   - Las rutas de estadísticas ya están integradas en `/api/stats/*`
   - Se requiere autenticación con Clerk
   - Solo usuarios con rol `admin` pueden acceder

2. **Variables de entorno necesarias:**
   ```env
   DATABASE_URL=your_postgresql_connection_string
   DIRECT_URL=your_direct_postgresql_connection_string
   ```

### Frontend (Next.js)

1. **Verificar que los componentes estén disponibles:**
   - Todos los componentes están en `/components/`
   - Las rutas de API están en `/app/api/stats/*`

2. **Variables de entorno necesarias:**
   ```env
   BACKEND_URL=http://localhost:8787  # URL del backend Hono
   ```

## Uso

### Acceso al Panel

1. Navegar a `/deploys` en la aplicación
2. El panel de estadísticas es la primera pestaña por defecto
3. Se requieren permisos de administrador

### Navegación

- **Estadísticas**: Vista general del sistema
- **Eventos**: Análisis detallado de eventos
- **Usuarios**: Métricas de usuarios y roles
- **Ingresos**: Análisis financiero
- **Rendimiento**: KPIs y recomendaciones

### Funcionalidades

- **Actualización en tiempo real**: Botón de refresh para actualizar datos
- **Filtros automáticos**: Los datos se filtran por permisos de usuario
- **Responsive**: Funciona en dispositivos móviles y desktop
- **Exportación**: Los datos se pueden copiar fácilmente

## Seguridad

### Autenticación
- Todas las rutas requieren autenticación con Clerk
- Verificación de token en cada petición

### Autorización
- Solo usuarios con rol `admin` pueden acceder
- Verificación de permisos en el backend
- Filtrado de datos por usuario autenticado

### Validación
- Validación de entrada en todas las APIs
- Manejo de errores robusto
- Logs de auditoría para acciones administrativas

## Estructura de Archivos

```
ticketeate/
├── apps/
│   ├── hono-backend/
│   │   ├── src/routes/stats.ts          # Nuevas rutas de estadísticas
│   │   └── src/routes/api.ts            # Integración de rutas
│   └── next-frontend/
│       ├── app/api/stats/               # Rutas de API del frontend
│       │   ├── overview/route.ts
│       │   ├── events/route.ts
│       │   ├── users/route.ts
│       │   ├── revenue/route.ts
│       │   └── performance/route.ts
│       ├── components/                   # Componentes del dashboard
│       │   ├── admin-stats-dashboard.tsx
│       │   ├── stats-overview.tsx
│       │   ├── events-stats-table.tsx
│       │   ├── users-stats.tsx
│       │   ├── revenue-stats.tsx
│       │   └── performance-stats.tsx
│       └── hooks/
│           └── use-stats.ts             # Hook personalizado para estadísticas
```

## Personalización

### Agregar Nuevas Métricas

1. **Backend**: Agregar nueva ruta en `src/routes/stats.ts`
2. **Frontend**: Crear nuevo componente en `/components/`
3. **Hook**: Agregar nueva función en `use-stats.ts`
4. **Dashboard**: Integrar en `admin-stats-dashboard.tsx`

### Modificar Visualización

- Los componentes usan Tailwind CSS para estilos
- Sistema de diseño consistente con la aplicación
- Iconos de Lucide React
- Componentes UI reutilizables

## Troubleshooting

### Errores Comunes

1. **"Acceso denegado"**
   - Verificar que el usuario tenga rol `admin`
   - Comprobar autenticación con Clerk

2. **"Error interno del servidor"**
   - Verificar conexión a la base de datos
   - Revisar logs del backend

3. **Datos no se cargan**
   - Verificar variables de entorno
   - Comprobar permisos de usuario

### Logs

- Backend: Logs en consola del servidor Hono
- Frontend: Logs en consola del navegador
- Errores de API: Respuestas HTTP con detalles

## Mantenimiento

### Actualizaciones

- El panel se actualiza automáticamente al cargar
- Botón de refresh manual disponible
- Los datos se obtienen en tiempo real

### Backup

- Las estadísticas se calculan desde la base de datos
- No se almacenan datos duplicados
- Siempre refleja el estado actual del sistema

## Soporte

Para problemas o preguntas sobre el panel de administración:

1. Revisar logs del sistema
2. Verificar permisos de usuario
3. Comprobar conectividad de base de datos
4. Validar variables de entorno

---

**Nota**: Este panel está diseñado para ser no intrusivo y no afecta ninguna funcionalidad existente del sistema Ticketeate.
