#!/usr/bin/env node

/**
 * Script de prueba para simular el éxito de pago con Stripe
 * Uso: node test-stripe-success.js
 */

const https = require('https');
const url = require('url');

// Configuración
const BASE_URL = 'http://localhost:3000';
const TEST_USER_ID = 1;

console.log('🧪 Iniciando prueba de éxito con Stripe...\n');

// Función para hacer peticiones HTTP
function makeRequest(requestUrl, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(requestUrl);
    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.path,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = (parsedUrl.protocol === 'https:' ? https : require('http')).request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: res.headers['content-type']?.includes('application/json') ? JSON.parse(data) : data
          });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(typeof options.body === 'object' ? JSON.stringify(options.body) : options.body);
    }
    
    req.end();
  });
}

async function testStripeSuccess() {
  try {
    console.log('1️⃣ Probando acceso a página de compra con stripe_status=success...');
    
    const testUrl = `${BASE_URL}/comprar?stripe_status=success&evento=test-event-id`;
    console.log(`   URL: ${testUrl}`);
    
    const response = await makeRequest(testUrl);
    
    if (response.status === 200) {
      console.log('   ✅ Página cargada correctamente');
      console.log('   📝 La página debería mostrar el mensaje de "Compra exitosa"');
    } else {
      console.log(`   ❌ Error: Estado HTTP ${response.status}`);
    }

    console.log('\n2️⃣ Probando webhook de Stripe (simulado)...');
    
    const webhookPayload = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123456789',
          amount_total: 10000, // $100.00 en centavos
          metadata: {
            eventoid: 'test-event-id',
            usuarioid: TEST_USER_ID.toString(),
            cantidad: '2',
            sector: 'General'
          }
        }
      }
    };

    const webhookResponse = await makeRequest(`${BASE_URL}/api/stripe/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test-signature'
      },
      body: webhookPayload
    });

    if (webhookResponse.status === 200) {
      console.log('   ✅ Webhook procesado correctamente');
      console.log('   📝 Se deberían haber creado los registros en la base de datos');
    } else {
      console.log(`   ⚠️ Webhook respuesta: Estado ${webhookResponse.status}`);
      if (webhookResponse.data) {
        console.log(`   📄 Respuesta: ${JSON.stringify(webhookResponse.data, null, 2)}`);
      }
    }

    console.log('\n3️⃣ Probando endpoint de verificación de pago...');
    
    const verifyUrl = `${BASE_URL}/api/stripe/verify-payment?session_id=cs_test_123456789&usuario_id=${TEST_USER_ID}`;
    const verifyResponse = await makeRequest(verifyUrl);

    if (verifyResponse.status === 200) {
      console.log('   ✅ Verificación de pago exitosa');
      console.log('   📝 Datos del pago recuperados correctamente');
    } else {
      console.log(`   ⚠️ Verificación respuesta: Estado ${verifyResponse.status}`);
      if (verifyResponse.data) {
        console.log(`   📄 Respuesta: ${JSON.stringify(verifyResponse.data, null, 2)}`);
      }
    }

    console.log('\n🎉 Pruebas completadas!');
    console.log('\n📋 Pasos para probar manualmente:');
    console.log('1. Inicia el servidor de desarrollo: pnpm dev');
    console.log('2. Ve a http://localhost:3000/comprar?stripe_status=success');
    console.log('3. Deberías ver el mensaje de "¡Pago exitoso!"');
    console.log('4. Después del mensaje inicial, deberías poder descargar el comprobante');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
  }
}

// Ejecutar pruebas
testStripeSuccess();
