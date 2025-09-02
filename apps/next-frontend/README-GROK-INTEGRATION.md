# Integración con Grok 3 para Generación de Descripciones

Esta implementación integra Grok 3 (xAI) para generar descripciones de eventos de manera automática usando IA.

## Configuración

### 1. Obtener API Key de Grok

1. Visita [xAI Console](https://console.x.ai/)
2. Crea una cuenta o inicia sesión
3. Navega a la sección de API Keys
4. Genera una nueva API key

### 2. Configurar Variables de Entorno

Agrega la siguiente variable a tu archivo `.env.local`:

```bash
GROK_API_KEY=tu_api_key_de_grok_aqui
```

### 3. Estructura de Archivos

Los siguientes archivos han sido creados/modificados:

- `app/api/generate-description/route.ts` - API route para comunicarse con Grok
- `hooks/use-description-generator.ts` - Hook personalizado para manejar la generación
- `components/event-description.tsx` - Componente actualizado con integración real
- `env.example` - Ejemplo de variables de entorno actualizado

## Uso

### En el Componente EventDescription

El componente ahora acepta props adicionales opcionales:

```tsx
<EventDescription
  onDescriptionChange={handleDescriptionChange}
  eventTitle="Mi Evento Especial" // Opcional
  eventType="Conferencia" // Opcional
/>
```

### Configuración de IA

El modal de IA permite configurar:

- **Estado de ánimo**: Creativo, Profesional, Divertido
- **Longitud**: Corta, Mediana, Larga
- **Instrucciones adicionales**: Texto libre para personalizar la generación

## API Endpoint

### POST `/api/generate-description`

**Request Body:**

```json
{
  "mood": "creative" | "professional" | "fun",
  "length": "short" | "medium" | "long",
  "additionalInstructions": "string (opcional)",
  "eventTitle": "string (opcional)",
  "eventType": "string (opcional)"
}
```

**Response:**

```json
{
  "description": "string",
  "success": true
}
```

## Características

- ✅ Integración real con Grok 3 API
- ✅ Manejo de errores robusto
- ✅ Estados de carga con animaciones
- ✅ Configuración flexible (mood, length, instrucciones)
- ✅ Soporte para contexto del evento (título, tipo)
- ✅ Generación en español
- ✅ Prompts optimizados para eventos

## Manejo de Errores

El sistema maneja los siguientes tipos de errores:

- API key no configurada
- Errores de red
- Respuestas inválidas de Grok
- Timeouts

Los errores se muestran en la interfaz de usuario con mensajes descriptivos.

## Costos

Ten en cuenta que cada generación de descripción consume tokens de la API de Grok. Los costos varían según la longitud y complejidad de la descripción generada.

## Seguridad

- Las API keys se mantienen en variables de entorno del servidor
- No se exponen credenciales en el frontend
- Validación de entrada en el API route
- Manejo seguro de errores sin exponer información sensible
