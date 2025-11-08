// Script de testing para probar comprobante PDF
// Ejecutar desde la consola del navegador en /comprar

const testComprarTarjeta = async () => {
  console.log('🧪 TESTING: Compra con tarjeta de débito');
  
  // Simular datos de prueba
  const datosCompra = {
    id_usuario: 1,
    id_evento: 'evento-test-123',
    cantidad: 2,
    metodo_pago: 'tarjeta_debito',
    moneda: 'ARS',
    datos_tarjeta: {
      numero: '4111111111111111',
      vencimiento: '12/25',
      cvv: '123',
      dni: '12345678'
    }
  };

  try {
    console.log('📤 Enviando solicitud a /api/comprar...');
    const response = await fetch('/api/comprar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datosCompra)
    });

    console.log('📥 Respuesta recibida:', response.status);
    const result = await response.json();
    console.log('📄 Datos:', result);

    if (response.ok) {
      console.log('✅ Compra exitosa!');
      console.log('🎫 Reserva ID:', result.reserva?.reservaid);
      console.log('💳 Pago ID:', result.pago?.pagoid);
      console.log('🎯 Entradas generadas:', result.entradas?.length);
      
      // Verificar estructura
      const estructura = {
        tieneReserva: !!result.reserva,
        tieneReservaId: !!result.reserva?.reservaid,
        tienePago: !!result.pago,
        tieneEntradas: Array.isArray(result.entradas) && result.entradas.length > 0,
        tieneResumen: !!result.resumen
      };
      
      console.log('🔍 Estructura de respuesta:', estructura);
      
      if (estructura.tieneReservaId) {
        console.log('🎉 ¡PERFECTO! El comprobante puede generarse con ID:', result.reserva.reservaid);
      } else {
        console.log('❌ PROBLEMA: No se generó reservaid');
      }
      
    } else {
      console.log('❌ Error en compra:', result.error);
    }
    
  } catch (error) {
    console.log('💥 Error de red:', error);
  }
};

// Ejecutar test
testComprarTarjeta();
