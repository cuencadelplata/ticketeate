# Solución: Redirección tras Pago Exitoso con Stripe

## Problema Identificado
Cuando el usuario completaba un pago exitoso con Stripe, en lugar de quedarse en la página `/comprar` del evento específico con el mensaje de "Compra exitosa", era redirigido incorrectamente a `/descubrir` o otra página.

## Causas del Problema

### 1. URLs de Stripe sin Evento
Las URLs de éxito y cancelación en Stripe no incluían el ID del evento:
```typescript
// ❌ ANTES - URLs sin evento
success_url: `${baseUrl}/comprar?stripe_status=success`
cancel_url: `${baseUrl}/comprar?stripe_status=cancel`
```

### 2. Redirección Automática Incorrecta
Había un `setTimeout` que redirigía automáticamente después de cualquier compra exitosa:
```typescript
// ❌ ANTES - Redirigía para todos los métodos
setTimeout(() => {
  router.push('/'); // Esto causaba la redirección no deseada
}, 10000);
```

### 3. Estado de Evento No Persistente
El estado del evento no se mantenía correctamente cuando el usuario regresaba de Stripe.

## Soluciones Implementadas

### 1. ✅ URLs Mejoradas con ID de Evento
```typescript
// ✅ DESPUÉS - URLs incluyen el evento
const eventParam = metadata?.eventoid ? `&evento=${metadata.eventoid}` : '';
success_url: `${baseUrl}/comprar?stripe_status=success${eventParam}`
cancel_url: `${baseUrl}/comprar?stripe_status=cancel${eventParam}`
```

### 2. ✅ Control de Redirección por Método de Pago
```typescript
// ✅ DESPUÉS - Solo redirige para métodos tradicionales
if (metodo !== 'stripe') {
  setTimeout(() => {
    // ... redirección automática solo para tarjetas
  }, 10000);
}
```

### 3. ✅ Persistencia del Estado del Evento
```typescript
// ✅ DESPUÉS - Mantiene el evento cuando regresa de Stripe
useEffect(() => {
  if (stripeStatus === 'success') {
    // Asegurar que tenemos un evento seleccionado
    if (eventId && !selectedEvent && eventData) {
      setSelectedEvent(eventData);
      setShowEventSelection(false);
    }
    // ... resto de la lógica
  }
}, [stripeStatus, router, eventId, selectedEvent, eventData]);
```

### 4. ✅ Interfaz de Usuario Mejorada
- Eliminado temporizador automático para Stripe
- Botón explícito "Volver al menú principal"
- Mensaje más claro sin presionar al usuario

## Flujo Corregido

1. **Usuario selecciona Stripe** en `/comprar?evento=ABC123`
2. **Se crea sesión de Stripe** con metadata y URLs correctas
3. **Usuario completa pago** en Stripe Checkout
4. **Stripe redirige** a `/comprar?stripe_status=success&evento=ABC123`
5. **Se detecta el éxito** y se carga el evento ABC123
6. **Se muestra mensaje inicial** "¡Pago exitoso!"
7. **Usuario continúa** y ve la pantalla de comprobante
8. **Usuario controla** cuándo quiere irse (botón manual)

## Archivos Modificados

### Backend
- `app/api/stripe/create-session/route.ts` - URLs con evento

### Frontend  
- `app/comprar/page.tsx` - Lógica de manejo de Stripe
- `components/comprar/SuccessCard.tsx` - Interfaz mejorada
- `components/comprar/StripeSuccessMessage.tsx` - Mensaje inicial

## Pruebas

### Prueba Manual
1. Ir a `/comprar?evento=EVENTO_ID`
2. Seleccionar Stripe como método de pago
3. Completar pago en Stripe
4. Verificar que regresa a `/comprar?stripe_status=success&evento=EVENTO_ID`
5. Confirmar que aparece el mensaje de éxito
6. Verificar que se puede descargar comprobante
7. Confirmar que NO hay redirección automática

### Prueba con URLs Directas
```bash
# Simular éxito de Stripe
http://localhost:3000/comprar?stripe_status=success&evento=test-123

# Simular cancelación
http://localhost:3000/comprar?stripe_status=cancel&evento=test-123
```

## Resultado Final

✅ **El usuario ahora permanece en `/comprar` del evento específico**  
✅ **Ve el mensaje "Compra exitosa" correctamente**  
✅ **Puede descargar el comprobante cuando quiera**  
✅ **Tiene control total sobre cuándo abandonar la página**  
✅ **No hay redirecciones automáticas no deseadas**

## Prevención de Regresiones

Para evitar que este problema vuelva a ocurrir:

1. **Siempre incluir `evento` en URLs de redirección** de proveedores de pago
2. **Probar el flujo completo** desde selección hasta éxito
3. **Revisar todos los `setTimeout` y `router.push`** antes de agregar redirecciones
4. **Mantener el estado del evento** durante todo el proceso de pago
