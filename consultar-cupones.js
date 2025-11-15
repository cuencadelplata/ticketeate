// Script para consultar cupones en la base de datos
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function consultarCupones() {
  try {
    console.log('\n=== CUPONES EN LA BASE DE DATOS ===\n');
    
    const cupones = await prisma.cupones_evento.findMany({
      where: {
        is_active: true
      },
      orderBy: {
        fecha_creacion: 'desc'
      },
      take: 50
    });

    if (cupones.length === 0) {
      console.log('❌ No hay cupones en la base de datos');
      return;
    }

    cupones.forEach((cupon, index) => {
      console.log(`${index + 1}. Código: ${cupon.codigo}`);
      console.log(`   Descuento: ${cupon.porcentaje_descuento}%`);
      console.log(`   Expira: ${cupon.fecha_expiracion.toISOString()}`);
      console.log(`   Usos: ${cupon.usos_actuales}/${cupon.limite_usos}`);
      console.log(`   Estado: ${cupon.estado}`);
      console.log(`   Event ID: ${cupon.eventoid}`);
      console.log('');
    });

    console.log(`Total: ${cupones.length} cupones\n`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

consultarCupones();
