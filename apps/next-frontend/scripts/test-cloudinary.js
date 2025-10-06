const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');
const path = require('path');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testCloudinaryConnection() {
  console.log('🔍 Probando conexión con Cloudinary...\n');

  // Verificar configuración
  console.log('📋 Configuración:');
  console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME || 'NO CONFIGURADO'}`);
  console.log(`   API Key: ${process.env.CLOUDINARY_API_KEY ? '✅ Configurado' : '❌ NO CONFIGURADO'}`);
  console.log(`   API Secret: ${process.env.CLOUDINARY_API_SECRET ? '✅ Configurado' : '❌ NO CONFIGURADO'}\n`);

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('❌ Error: Faltan variables de entorno de Cloudinary');
    console.log('\n📝 Configura las siguientes variables en tu .env.local:');
    console.log('   CLOUDINARY_CLOUD_NAME=tu-cloud-name');
    console.log('   CLOUDINARY_API_KEY=tu-api-key');
    console.log('   CLOUDINARY_API_SECRET=tu-api-secret');
    return;
  }

  try {
    // Probar conexión con la API
    console.log('🌐 Probando conexión con la API...');
    const result = await cloudinary.api.ping();
    console.log('✅ Conexión exitosa:', result.message || 'Pong!');

    // Obtener información de la cuenta
    console.log('\n📊 Información de la cuenta:');
    const accountInfo = await cloudinary.api.usage();
    console.log(`   Plan: ${accountInfo.plan}`);
    console.log(`   Transformaciones: ${accountInfo.transformations?.used || 0}/${accountInfo.transformations?.limit || 'ilimitado'}`);
    console.log(`   Almacenamiento: ${accountInfo.bytes?.used || 0}/${accountInfo.bytes?.limit || 'ilimitado'} bytes`);

    // Probar subida de imagen de prueba
    console.log('\n📤 Probando subida de imagen...');
    
    // Crear una imagen SVG simple de prueba
    const testImageSvg = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#3B82F6"/>
      <text x="50" y="50" text-anchor="middle" fill="white" font-family="Arial" font-size="12">TEST</text>
    </svg>`;

    const uploadResult = await cloudinary.uploader.upload(
      `data:image/svg+xml;base64,${Buffer.from(testImageSvg).toString('base64')}`,
      {
        folder: 'ticketeate/test',
        public_id: `test_profile_${Date.now()}`,
        resource_type: 'image',
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { fetch_format: 'auto', quality: 'auto' },
        ],
        tags: ['test', 'profile'],
      }
    );

    console.log('✅ Imagen de prueba subida exitosamente:');
    console.log(`   URL: ${uploadResult.secure_url}`);
    console.log(`   Public ID: ${uploadResult.public_id}`);
    console.log(`   Formato: ${uploadResult.format}`);
    console.log(`   Tamaño: ${uploadResult.bytes} bytes`);

    // Probar eliminación
    console.log('\n🗑️ Probando eliminación...');
    const deleteResult = await cloudinary.uploader.destroy(uploadResult.public_id);
    console.log('✅ Imagen eliminada:', deleteResult.result);

    console.log('\n🎉 ¡Cloudinary está configurado correctamente!');
    console.log('\n📁 Estructura de carpetas recomendada:');
    console.log('   ticketeate/');
    console.log('   ├── profiles/');
    console.log('   │   └── {userId}/');
    console.log('   └── events/');
    console.log('       └── {eventId}/');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('Invalid API credentials')) {
      console.log('\n💡 Solución: Verifica que las credenciales de Cloudinary sean correctas');
    } else if (error.message.includes('Cloud name')) {
      console.log('\n💡 Solución: Verifica que el cloud name sea correcto');
    }
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  testCloudinaryConnection().catch(console.error);
}

module.exports = { testCloudinaryConnection };
