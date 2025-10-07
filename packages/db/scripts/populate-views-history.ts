import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function populateInitialViewsHistory() {
  try {
    console.log('Iniciando población de datos históricos de views...');

    // Obtener todos los eventos que tienen views > 0
    const eventos = await prisma.eventos.findMany({
      where: {
        views: {
          gt: 0,
        },
      },
      select: {
        eventoid: true,
        views: true,
        fecha_creacion: true,
      },
    });

    console.log(`Encontrados ${eventos.length} eventos con views`);

    for (const evento of eventos) {
      const eventId = evento.eventoid;
      const totalViews = evento.views;
      const fechaCreacion = evento.fecha_creacion;

      // Calcular días desde la creación hasta hoy
      const hoy = new Date();
      const diasDesdeCreacion = Math.ceil(
        (hoy.getTime() - fechaCreacion.getTime()) / (1000 * 60 * 60 * 24),
      );

      // Si el evento tiene menos de 1 día, crear solo el registro de hoy
      const diasParaCrear = Math.min(diasDesdeCreacion, 30); // Máximo 30 días

      if (diasParaCrear <= 0) {
        // Crear solo el registro de hoy
        await prisma.evento_views_history.upsert({
          where: {
            unique_evento_fecha: {
              eventoid: eventId,
              fecha: hoy,
            },
          },
          update: {
            views_count: totalViews,
            updated_at: new Date(),
          },
          create: {
            id: `${eventId}_${hoy.toISOString().split('T')[0]}`,
            eventoid: eventId,
            fecha: hoy,
            views_count: totalViews,
          },
        });
        console.log(`✓ Creado registro para evento ${eventId} - Hoy: ${totalViews} views`);
        continue;
      }

      // Distribuir las views de manera realista a lo largo de los días
      const viewsPorDia = Math.floor(totalViews / diasParaCrear);
      const viewsRestantes = totalViews % diasParaCreacion;

      for (let i = 0; i < diasParaCrear; i++) {
        const fecha = new Date(hoy);
        fecha.setDate(fecha.getDate() - (diasParaCreacion - 1 - i));

        // Agregar variación aleatoria pero realista
        const variacion = (Math.random() - 0.5) * 0.3; // ±15% de variación
        let viewsDelDia = Math.floor(viewsPorDia * (1 + variacion));

        // Agregar views restantes a los últimos días
        if (i >= diasParaCrear - viewsRestantes) {
          viewsDelDia += 1;
        }

        // Asegurar que no sea negativo
        viewsDelDia = Math.max(0, viewsDelDia);

        await prisma.evento_views_history.upsert({
          where: {
            unique_evento_fecha: {
              eventoid: eventId,
              fecha: fecha,
            },
          },
          update: {
            views_count: viewsDelDia,
            updated_at: new Date(),
          },
          create: {
            id: `${eventId}_${fecha.toISOString().split('T')[0]}`,
            eventoid: eventId,
            fecha: fecha,
            views_count: viewsDelDia,
          },
        });
      }

      console.log(
        `✓ Creados ${diasParaCrear} registros para evento ${eventId} - Total: ${totalViews} views`,
      );
    }

    console.log('✅ Población de datos históricos completada');
  } catch (error) {
    console.error('❌ Error al poblar datos históricos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  populateInitialViewsHistory();
}

export { populateInitialViewsHistory };
