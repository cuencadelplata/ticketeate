# EventMapModal - Mapa de Sectores de Evento

## Descripción
El componente `EventMapModal` permite crear mapas personalizados para eventos, donde se pueden definir diferentes sectores (General, VIP, Premium, etc.) con sus respectivas capacidades y precios.

## Características

### 🎯 Funcionalidades Principales
- **Creación de sectores**: Click directo para agregar sectores al canvas
- **Tipos de sectores**: General, VIP, Premium y Personalizado
- **Elementos de infraestructura**: Escenario, baños, cantina, entrada, salida, estacionamiento
- **Sistema de grid**: Crea sectores con filas y columnas para asientos
- **Redimensionamiento**: Arrastra las esquinas para cambiar el tamaño (sectores y elementos)
- **Grid de alineación**: Grid visual para mejor organización
- **Snap to grid**: Alineación automática al grid
- **Imagen de fondo**: Sube una imagen para personalizar el mapa
- **Propiedades personalizables**: Nombre, capacidad y precio por sector

### 🎨 Tipos de Sectores
- **General** (Azul oscuro): Sector estándar para el público general
- **VIP** (Naranja): Sector premium con beneficios especiales
- **Premium** (Púrpura): Sector de máxima categoría
- **Personalizado** (Verde): Sector con configuración libre

### 🏗️ Elementos de Infraestructura
- **Escenario** (🎭): Área principal del evento
- **Baños** (🚻): Servicios sanitarios
- **Cantina/Bar** (🍺): Área de comida y bebidas
- **Entrada** (🚪): Punto de acceso principal
- **Salida** (🚪): Punto de salida
- **Estacionamiento** (🅿️): Área de estacionamiento

### 🛠️ Uso del Editor

#### Agregar Sectores
1. En el panel lateral, pestaña "Sectores", encuentra el tipo de sector deseado
2. Haz clic en el botón del sector que quieres agregar
3. El sector aparecerá automáticamente en el canvas
4. Arrastra el sector para posicionarlo donde desees

#### Agregar Elementos de Infraestructura
1. En el panel lateral, pestaña "Elementos", selecciona el elemento deseado
2. Haz clic en el botón del elemento que quieres agregar
3. El elemento aparecerá automáticamente en el canvas
4. Arrastra el elemento para posicionarlo donde desees

#### Crear Grid de Asientos
1. En el panel lateral, pestaña "Grid", selecciona una configuración predefinida
2. Haz clic en el botón del grid deseado (ej: 5x10, 8x12, etc.)
3. El grid se creará automáticamente en el canvas con capacidad calculada
4. Puedes redimensionar y mover el grid como cualquier sector
5. La capacidad se recalcula automáticamente al cambiar filas o columnas

#### Mover Sectores
- Arrastra cualquier sector para reposicionarlo
- Los sectores se mantienen dentro de los límites del canvas

#### Redimensionar Sectores y Elementos
- Arrastra las esquinas (handles) para cambiar el tamaño
- Sectores: Tamaño mínimo 50x30 píxeles
- Elementos: Tamaño mínimo 40x40 píxeles
- Con "Alinear al grid" activado, el tamaño se ajustará al grid

#### Personalizar Sectores
1. Haz clic en un sector para seleccionarlo
2. En el panel lateral, edita:
   - **Nombre**: Identificador del sector
   - **Capacidad**: Número máximo de personas (opcional)
   - **Precio**: Costo del sector (opcional)

#### Grid de Alineación
- **Mostrar grid**: Activa/desactiva las líneas de alineación visual
- **Alinear al grid**: Los elementos se alinean automáticamente al grid
- **Tamaño del grid**: 20x20 píxeles por defecto
- **Beneficios**: Mejor organización y alineación de elementos

#### Imagen de Fondo
- Sube una imagen para personalizar el fondo del mapa
- Formatos soportados: JPG, PNG, GIF
- La imagen se ajusta automáticamente al canvas

### 📱 Interfaz

#### Panel de Herramientas (Izquierda)
- **Pestañas**: Sectores, Elementos, Grid
- **Sectores disponibles**: Haz clic para agregar sectores al canvas
- **Elementos de infraestructura**: Haz clic para agregar elementos como escenario, baños, etc.
- **Grid de asientos**: Crea sectores con filas y columnas predefinidas
- **Opciones de alineación**: Mostrar grid y alinear al grid
- **Carga de imagen**: Sube una imagen de fondo
- **Lista de elementos**: Ve y gestiona todos los sectores y elementos creados
- **Propiedades**: Edita las características del elemento seleccionado

#### Canvas (Centro)
- **Área de trabajo**: 800x600 píxeles
- **Grid visual**: Líneas de alineación cada 20 píxeles
- **Vista previa**: Muestra el mapa en tiempo real
- **Interacciones**: Haz clic en el panel para agregar, arrastrar para mover
- **Redimensionamiento**: Handles en las esquinas para sectores y elementos

#### Controles (Inferior)
- **Reiniciar**: Limpia todo el mapa
- **Cancelar**: Cierra sin guardar
- **Guardar**: Guarda el mapa y cierra el modal

### 🔧 Integración

El componente se integra automáticamente en el formulario de creación de eventos:

```tsx
// En EventLocation
<EventMapModal
  isOpen={isMapModalOpen}
  onClose={() => setIsMapModalOpen(false)}
  onSave={handleMapSave}
  initialMapData={selectedLocation?.eventMap}
/>
```

### 📊 Datos del Mapa

El mapa se guarda con la siguiente estructura:

```typescript
interface EventMapData {
  sectors: Array<{
    id: string;
    name: string;
    type: 'general' | 'vip' | 'premium' | 'custom';
    color: string;
    x: number;
    y: number;
    width: number;
    height: number;
    capacity?: number;
    price?: number;
    isGrid?: boolean;
    rows?: number;
    columns?: number;
  }>;
  elements?: Array<{
    id: string;
    name: string;
    type: 'stage' | 'bathroom' | 'bar' | 'entrance' | 'exit' | 'parking' | 'custom';
    icon: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
  }>;
  backgroundImage?: string;
}
```

### 🎯 Casos de Uso

1. **Conciertos**: Definir escenario, VIP, general, backstage
2. **Conferencias**: Salas, áreas de networking, stands
3. **Festivales**: Múltiples escenarios, áreas de comida, descanso
4. **Eventos deportivos**: Cancha, tribunas, áreas premium
5. **Ferias**: Stands, áreas de exposición, servicios

### 💡 Consejos de Uso

- **Planifica primero**: Dibuja un boceto antes de crear el mapa digital
- **Usa colores consistentes**: Mantén la misma paleta para sectores similares
- **Nombres descriptivos**: Usa nombres claros para cada sector
- **Capacidades realistas**: Define capacidades basadas en el espacio real
- **Imagen de fondo**: Usa planos o diagramas del lugar para mayor precisión

### 🚀 Próximas Mejoras

- [ ] Zoom y pan en el canvas
- [ ] Plantillas predefinidas
- [ ] Exportación a imagen
- [ ] Sectores con formas personalizadas
- [ ] Integración con sistemas de venta de tickets
