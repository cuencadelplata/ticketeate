# Historial de Compras - Ticketeate

## Descripción

Se ha implementado un sistema completo de historial de compras para usuarios que permite rastrear todas las compras de entradas para eventos.

## Funcionalidades Implementadas

### 1. Base de Datos

- **Esquema existente**: Se utiliza el esquema actual de la base de datos que incluye:
  - `reservas`: Tabla principal de compras/reservas
  - `pagos`: Información de pagos asociados
  - `entradas`: Tickets generados
  - `eventos`: Información de eventos
  - `stock_entrada`: Tipos de entradas disponibles

### 2. Backend (API)

- **Servicio de Compras** (`/lib/purchases.ts`):
  - `getUserPurchaseHistory()`: Obtiene historial completo de un usuario
  - `getPurchaseById()`: Obtiene una compra específica
  - `updatePurchaseStatus()`: Actualiza estado de una compra
  - `getUserPurchaseStats()`: Estadísticas de compras del usuario

- **Endpoints API**:
  - `GET /api/purchases/history`: Historial de compras del usuario autenticado
  - `GET /api/purchases/[id]`: Obtener compra específica
  - `PATCH /api/purchases/[id]`: Actualizar estado de compra
  - `POST /api/purchases`: Crear nueva compra (pendiente de implementar)

### 3. Frontend

- **Hook personalizado** (`/hooks/use-purchases.ts`):
  - Manejo de estado para compras
  - Funciones de carga y actualización
  - Manejo de errores

- **Componente principal** (`/components/purchase-history.tsx`):
  - Visualización del historial de compras
  - Estadísticas de compras (total gastado, cantidad de compras, etc.)
  - Estados de carga y error
  - Diseño responsive y moderno

- **Página dedicada** (`/app/mis-compras/page.tsx`):
  - Página completa para mostrar el historial
  - Integración con el sistema de navegación

### 4. Navegación

- Agregado enlace "Mis Compras" en la barra de navegación principal
- Acceso directo desde cualquier página del sitio

## Estructura de Datos

### PurchaseHistoryItem

```typescript
interface PurchaseHistoryItem {
  id: string; // ID de la reserva
  event: {
    id: string;
    name: string;
    description: string | null;
    startDate: Date;
    location: string | null;
    imageUrl: string | null;
  };
  ticketOption: {
    id: string;
    name: string;
    description: string | null;
    price: number;
  } | null;
  quantity: number; // Cantidad de entradas
  totalAmount: number; // Monto total pagado
  status: string; // Estado de la reserva
  paymentMethod: string | null; // Método de pago
  purchaseDate: Date; // Fecha de compra
  tickets: Array<{
    id: string;
    status: string;
  }>; // Tickets generados
}
```

### Estadísticas de Usuario

```typescript
interface PurchaseStats {
  totalPurchases: number; // Total de compras realizadas
  totalSpent: number; // Total gastado
  completedPurchases: number; // Compras completadas
}
```

## Estados de Compra

- **PENDIENTE**: Reserva creada pero pago no confirmado
- **CONFIRMADA**: Reserva confirmada y pago completado
- **CANCELADA**: Reserva cancelada
- **REEMBOLSADA**: Reserva reembolsada

## Características del UI

### Dashboard de Estadísticas

- Tarjetas con métricas principales
- Iconos descriptivos
- Formato de moneda local (ARS)

### Lista de Compras

- Tarjetas individuales por compra
- Información detallada del evento
- Estado visual con badges de colores
- Información de tickets generados
- Fechas formateadas en español

### Estados de Carga

- Skeletons mientras carga la información
- Manejo de errores con opción de reintentar
- Estado vacío cuando no hay compras

## Próximos Pasos Recomendados

1. **Integración con Clerk**: Conectar con el sistema de autenticación real
2. **Filtros y Búsqueda**: Agregar filtros por estado, fecha, evento
3. **Exportación**: Permitir exportar historial a PDF/Excel
4. **Notificaciones**: Alertas de cambios de estado
5. **Reembolsos**: Funcionalidad para solicitar reembolsos
6. **QR Codes**: Visualización de códigos QR de entradas
7. **Imágenes de Eventos**: Integrar imágenes desde `imagenes_evento`

## Uso

1. Los usuarios autenticados pueden acceder a "Mis Compras" desde la navegación
2. Se muestra el historial completo con estadísticas
3. Cada compra muestra detalles del evento, tickets y estado de pago
4. Los usuarios pueden ver el estado de sus entradas

## Consideraciones Técnicas

- **Seguridad**: Todas las consultas están protegidas por autenticación
- **Performance**: Consultas optimizadas con `include` de Prisma
- **Escalabilidad**: Estructura preparada para grandes volúmenes de datos
- **Mantenibilidad**: Código modular y bien documentado
