import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/db';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    // En un entorno de producción, deberías verificar la firma del webhook
    // usando la biblioteca de Stripe y tu webhook secret

    let event;
    try {
      event = JSON.parse(body);
    } catch (err) {
      console.error('Webhook parse error:', err);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    console.log('Stripe webhook received:', event.type);

    // Manejar el evento de pago exitoso
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      console.log('Payment succeeded for session:', session.id);
      console.log('Session metadata:', session.metadata);

      const { eventoid, usuarioid, cantidad, sector } = session.metadata || {};

      if (!eventoid || !usuarioid || !cantidad) {
        console.error('Missing required metadata in Stripe session');
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
      }

      try {
        // Procesar el pago usando la misma lógica que en /api/comprar
        const resultado = await prisma.$transaction(async (tx) => {
          // Asegurar usuario existente
          await tx.user.upsert({
            where: { id: String(usuarioid) },
            update: { updatedAt: new Date() },
            create: {
              id: String(usuarioid),
              name: 'Invitado',
              email: `guest-${String(usuarioid)}@example.com`,
              emailVerified: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });

          // Obtener evento con fechas y stock
          const evento = await tx.eventos.findUnique({
            where: { eventoid },
            include: {
              stock_entrada: true,
              fechas_evento: true,
            },
          });

          if (!evento) {
            throw new Error('Evento no encontrado');
          }

          // Obtener la primera fecha del evento y el primer stock de entrada
          const fechaEvento = evento.fechas_evento[0];
          const categoriaEntrada =
            evento.stock_entrada.find(
              (s: any) =>
                String(s.nombre).toLowerCase() === String(sector || 'general').toLowerCase(),
            ) || evento.stock_entrada[0];

          if (!fechaEvento || !categoriaEntrada) {
            throw new Error('Evento no tiene fechas o stock de entradas configurado');
          }

          // Crear reserva
          const reserva = await tx.reservas.create({
            data: {
              reservaid: randomUUID(),
              usuarioid: String(usuarioid),
              eventoid: eventoid,
              fechaid: fechaEvento.fechaid,
              categoriaid: categoriaEntrada.stockid,
              cantidad: parseInt(cantidad),
              estado: 'CONFIRMADA',
            },
          });

          // Crear entradas
          const entradas = [];
          for (let i = 0; i < parseInt(cantidad); i++) {
            const entrada = await tx.entradas.create({
              data: {
                entradaid: randomUUID(),
                reservaid: reserva.reservaid,
                codigo_qr: `${reserva.reservaid}-${Date.now()}-${i}`,
                estado: 'VALIDA',
              },
            });
            entradas.push(entrada);
          }

          // Crear registro de pago
          const pago = await tx.pagos.create({
            data: {
              pagoid: randomUUID(),
              reservaid: reserva.reservaid,
              metodo_pago: 'stripe',
              monto_total: new Prisma.Decimal(session.amount_total / 100), // Stripe envía en centavos
              estado: 'COMPLETADO',
            },
          });

          // Registrar movimiento de stock
          await tx.movimientos_entradas.create({
            data: {
              movimientoid: randomUUID(),
              stockid: categoriaEntrada.stockid,
              usuarioid: String(usuarioid),
              cantidad: parseInt(cantidad),
              tipo: 'VENTA',
              fecha_mov: new Date(),
            },
          });

          // Registrar historial de compra para Stripe
          const historialId = randomUUID();
          const comprobanteUrl = null; // URL del comprobante si se genera
          const montoTotalDecimal = new Prisma.Decimal(session.amount_total / 100); // Stripe envía en centavos

          await tx.$executeRaw`INSERT INTO historial_compras (
            id, usuarioid, reservaid, eventoid, cantidad, monto_total, moneda, estado_compra, fecha_compra, fecha_evento, comprobante_url
          ) VALUES (
            ${historialId}, 
            ${String(usuarioid)}, 
            ${reserva.reservaid}, 
            ${eventoid}, 
            ${parseInt(cantidad)}, 
            ${montoTotalDecimal}, 
            ${'USD'}, 
            ${'COMPLETADO'}, 
            ${new Date()}, 
            ${fechaEvento.fecha_hora as any}, 
            ${comprobanteUrl}
          )`;

          return { reserva, pago, entradas, historialId };
        });

        console.log('Stripe payment processed successfully:', {
          reservaId: resultado.reserva.reservaid,
          pagoId: resultado.pago.pagoid,
          historialId: resultado.historialId,
          cantidadEntradas: resultado.entradas.length,
          montoTotal: session.amount_total / 100,
          moneda: 'USD',
        });

        return NextResponse.json({
          received: true,
          reservaId: resultado.reserva.reservaid,
          historialId: resultado.historialId,
        });
      } catch (error) {
        console.error('Error processing Stripe payment:', {
          sessionId: session.id,
          metadata: session.metadata,
          error: error instanceof Error ? error.message : error,
        });
        return NextResponse.json(
          {
            error: 'Failed to process payment',
            sessionId: session.id,
            details: error instanceof Error ? error.message : 'Unknown error',
          },
          { status: 500 },
        );
      }
    }

    // Manejar otros tipos de eventos si es necesario
    console.log(`Unhandled event type: ${event.type}`);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
