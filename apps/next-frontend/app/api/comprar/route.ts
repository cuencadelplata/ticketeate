import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/db';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

// Body esperado:
// {
//   id_usuario: number,
//   id_evento: string, // UUID del evento
//   cantidad: number,
//   metodo_pago: 'tarjeta_credito' | 'tarjeta_debito',
//   datos_tarjeta?: { numero: string; vencimiento: string; cvv: string; dni: string }
// }

export async function POST(request: NextRequest) {
  try {
    console.log('=== INICIANDO API COMPRAR ===');
    const body = await request.json();
    console.log('Body recibido:', body);
    const { id_usuario, id_evento, cantidad, metodo_pago, datos_tarjeta } = body ?? {};

    if (!id_usuario || !id_evento || !cantidad || !metodo_pago) {
      return NextResponse.json(
        {
          error: 'Faltan campos requeridos',
          campos_requeridos: ['id_usuario', 'id_evento', 'cantidad', 'metodo_pago'],
        },
        { status: 400 },
      );
    }

    // Validaciones simples
    if (cantidad <= 0 || cantidad > 5) {
      return NextResponse.json(
        {
          error: 'Cantidad debe estar entre 1 y 5',
        },
        { status: 400 },
      );
    }

    if (!['tarjeta_credito', 'tarjeta_debito'].includes(metodo_pago)) {
      return NextResponse.json(
        {
          error: 'Método de pago no válido. Use: tarjeta_credito o tarjeta_debito',
        },
        { status: 400 },
      );
    }

    // Validar datos de tarjeta (demo - no procesar reales en servidor sin PCI)
    if (['tarjeta_credito', 'tarjeta_debito'].includes(metodo_pago)) {
      const numeroOk =
        typeof datos_tarjeta?.numero === 'string' && /^\d{13,19}$/.test(datos_tarjeta.numero);
      const vencOk =
        typeof datos_tarjeta?.vencimiento === 'string' &&
        /^(0[1-9]|1[0-2])\/\d{2}$/.test(datos_tarjeta.vencimiento.trim());
      const cvvOk =
        typeof datos_tarjeta?.cvv === 'string' && /^\d{3,4}$/.test(datos_tarjeta.cvv.trim());
      const dniOk =
        typeof datos_tarjeta?.dni === 'string' && /^\d{7,10}$/.test(datos_tarjeta.dni.trim());
      if (!numeroOk || !vencOk || !cvvOk || !dniOk) {
        return NextResponse.json(
          {
            error: 'Datos de tarjeta inválidos',
            campos_requeridos: [
              'datos_tarjeta.numero (13-19 dígitos)',
              'datos_tarjeta.vencimiento (MM/AA)',
              'datos_tarjeta.cvv (3-4 dígitos)',
              'datos_tarjeta.dni (7-10 dígitos)',
            ],
          },
          { status: 400 },
        );
      }
    }

    // Verificar que el evento existe (usamos el esquema actual: 'eventos')
    console.log('Buscando evento:', id_evento);
    const evento = await prisma.eventos.findFirst({
      where: {
        eventoid: id_evento,
      },
      include: {
        fechas_evento: true,
        stock_entrada: true,
      },
    });

    console.log('Evento encontrado:', evento ? 'SÍ' : 'NO');

    if (!evento) {
      return NextResponse.json(
        {
          error: 'Evento no encontrado o no disponible',
        },
        { status: 404 },
      );
    }

    // Asegurar usuario existente para cumplir FK en 'reservas.usuarioid'
    await (prisma as any).user.upsert({
      where: { id: String(id_usuario) },
      update: { updatedAt: new Date() },
      create: {
        id: String(id_usuario),
        name: 'Invitado',
        email: `guest-${String(id_usuario)}@example.com`,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Obtener la primera fecha del evento y el primer stock de entrada
    const fechaEvento = evento.fechas_evento[0];
    const categoriaEntrada = evento.stock_entrada[0];

    console.log('Fecha evento:', fechaEvento);
    console.log('Categoría entrada:', categoriaEntrada);

    if (!fechaEvento || !categoriaEntrada) {
      return NextResponse.json(
        {
          error: 'Evento no tiene fechas o stock de entradas configurado',
          debug: {
            tiene_fechas: evento.fechas_evento?.length > 0,
            tiene_stock: evento.stock_entrada?.length > 0,
            fechas_count: evento.fechas_evento?.length || 0,
            stock_count: evento.stock_entrada?.length || 0,
          },
        },
        { status: 400 },
      );
    }

    // Verificar disponibilidad
    // Nota: el esquema actual no lleva control de stock disponible.
    // Si se necesitara, se debería calcular contra 'movimientos_entradas' o un campo agregado.

    // Calcular precio total
    const precio_unitario = Number(categoriaEntrada.precio);
    const monto_total = precio_unitario * cantidad;

    // Crear la reserva y entradas en una transacción
    console.log('Iniciando transacción de base de datos...');
    const resultado = await prisma.$transaction(async (tx) => {
      // Crear la reserva
      const reserva = await tx.reservas.create({
        data: {
          reservaid: randomUUID(),
          usuarioid: String(id_usuario),
          eventoid: id_evento,
          fechaid: fechaEvento.fechaid,
          categoriaid: categoriaEntrada.stockid,
          cantidad: cantidad,
          estado: 'CONFIRMADA',
        },
      });

      // Crear las entradas
      const entradas = [] as any[];
      for (let i = 0; i < cantidad; i++) {
        const codigo_qr = `${reserva.reservaid}-${Date.now()}-${i}`;
        const entrada = await tx.entradas.create({
          data: {
            entradaid: randomUUID(),
            reservaid: reserva.reservaid,
            codigo_qr: codigo_qr,
            estado: 'VALIDA',
          },
        });
        entradas.push(entrada);
      }

      // Crear el registro de pago
      const pago = await tx.pagos.create({
        data: {
          pagoid: randomUUID(),
          reservaid: reserva.reservaid,
          metodo_pago: metodo_pago,
          monto_total: new Prisma.Decimal(monto_total.toFixed(2)),
          estado: 'COMPLETADO',
        },
      });

      return {
        reserva,
        pago,
        entradas,
        resumen: {
          total_entradas: cantidad,
          precio_unitario: precio_unitario.toFixed(2),
          monto_total: monto_total.toFixed(2),
          metodo_pago,
          estado: 'Compra procesada exitosamente',
        },
      };
    });

    console.log('Transacción completada exitosamente');
    console.log('Resultado:', resultado);
    return NextResponse.json(resultado, { status: 201 });
  } catch (error) {
    console.error('Error en /api/comprar', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        detalles: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 },
    );
  }
}
