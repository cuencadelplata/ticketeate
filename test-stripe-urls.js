#!/usr/bin/env node

/**
 * Script para probar las URLs de éxito de Stripe
 */

// Simulación de los datos que se enviarán a Stripe
const testData = {
  title: "Festival de Jazz - General",
  quantity: 2,
  unit_price: 76.92, // USD convertido desde ARS
  currency: "USD",
  metadata: {
    eventoid: "12345-abcd-efgh-ijkl",
    usuarioid: "1",
    cantidad: "2",
    sector: "General"
  }
};

// Simulación de la construcción de URLs
const baseUrl = "http://localhost:3000";
const eventParam = testData.metadata?.eventoid ? `&evento=${testData.metadata.eventoid}` : '';

const successUrl = `${baseUrl}/comprar?stripe_status=success${eventParam}`;
const cancelUrl = `${baseUrl}/comprar?stripe_status=cancel${eventParam}`;

console.log('🧪 Prueba de URLs de Stripe\n');
console.log('📦 Datos de prueba:');
console.log(JSON.stringify(testData, null, 2));
console.log('\n🔗 URLs generadas:');
console.log('✅ Éxito:', successUrl);
console.log('❌ Cancelación:', cancelUrl);

console.log('\n📋 Pasos para probar:');
console.log('1. Inicia el servidor: pnpm dev');
console.log('2. Ve a la página de compra con un evento');
console.log('3. Selecciona Stripe como método de pago');
console.log('4. Completa el pago en Stripe');
console.log('5. Verifica que regrese a la URL de éxito con el evento');

console.log('\n🔍 URLs manuales de prueba:');
console.log('• Con éxito:', successUrl);
console.log('• Con cancelación:', cancelUrl);

console.log('\n✨ Comportamiento esperado:');
console.log('• El usuario regresa a /comprar con el evento cargado');
console.log('• Aparece el mensaje "¡Pago exitoso!"');
console.log('• Se puede descargar el comprobante');
console.log('• NO debe redireccionar automáticamente a otra página');
