import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/db';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Validar firma del webhook de Mercado Pago
function validateMercadoPagoSignature(request: NextRequest, body: string): boolean {
  try {
    const xSignature = request.headers.get('x-signature');
    const xRequestId = request.headers.get('x-request-id');

    if (!xSignature || !xRequestId) {
      console.warn('Missing signature headers from Mercado Pago webhook');
      // En desarrollo, permitir sin validación
      if (process.env.NODE_ENV === 'development') {
        return true;
      }
      return false;
    }

    // Parsear la firma (format: ts=timestamp,v1=hash)
    const parts = xSignature.split(',');
    const timestamp = parts[0]?.split('=')[1] || '';
    const hash = parts[1]?.split('=')[1] || '';

    // Reconstruir el hash
    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET || '';
    const toHash = `id=${xRequestId};request-id=${xRequestId};ts=${timestamp};${body}`;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(toHash);
    const computedHash = hmac.digest('hex');

    return hash === computedHash;
  } catch (error) {
    console.error('Error validating Mercado Pago signature:', error);
    // En desarrollo, permitir sin validación
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    return false;
  }
}

// Generar QR code como data URL
async function generateQRCode(data: string): Promise<string> {
  try {
    const qrDataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H' as any,
      width: 300,
      margin: 1,
    });
    return qrDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

// Enviar email con entradas
async function sendTicketEmail(
  email: string,
  name: string,
  eventTitle: string,
  tickets: Array<{ codigo_qr: string; qrDataUrl: string }>,
) {
  try {
    // Crear HTML del email
    const ticketsHtml = tickets
      .map(
        (ticket, index) => `
        <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Entrada #${index + 1}</h3>
          <img src="${ticket.qrDataUrl}" alt="QR Code" style="width: 200px; height: 200px; margin: 10px 0;" />
          <p style="margin: 10px 0; font-family: monospace; color: #666;">${ticket.codigo_qr}</p>
        </div>
      `,
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 8px; }
            .footer { margin-top: 20px; font-size: 12px; color: #999; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">¡Tus entradas están listas!</h1>
              <p style="margin: 5px 0 0 0;">${eventTitle}</p>
            </div>
            <div class="content">
              <p>Hola ${name},</p>
              <p>Gracias por tu compra. Adjunto encontrarás tus códigos QR para acceder al evento:</p>
              ${ticketsHtml}
              <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <strong>Instrucciones:</strong>
                <ul>
                  <li>Presenta cualquiera de estos códigos QR en la entrada</li>
                  <li>Un solo código QR por acceso</li>
                  <li>Mantén una copia digital o impresa disponible</li>
                </ul>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Ticketeate. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Ticketeate <noreply@ticketeate.com.ar>',
      to: email,
      subject: `Tus entradas para ${eventTitle}`,
      html,
    });

    console.log('Email sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    // Validar firma del webhook
    if (!validateMercadoPagoSignature(request, body)) {
      console.warn('Invalid Mercado Pago webhook signature');
      // En producción, rechazar. En desarrollo, continuar.
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    let event;
    try {
      event = JSON.parse(body);
    } catch (err) {
      console.error('Webhook parse error:', err);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    console.log('Mercado Pago webhook received:', event.type);

    // Procesar solo pagos aprobados
    if (event.type === 'payment') {
      const payment = event.data;

      // Solo procesar pagos aprobados
      if (payment.status !== 'approved') {
        console.log(`Payment ${payment.id} status: ${payment.status}`);
        return NextResponse.json({ received: true });
      }

      console.log('Processing approved payment:', payment.id);

      try {
        const resultado = await prisma.$transaction(async (tx) => {
          // Extraer metadata del pago
          const metadata = payment.metadata || {};
          const eventoid = metadata.eventoid || payment.additional_info?.items?.[0]?.id;
          const usuarioid = metadata.usuarioid;
          const cantidad = metadata.cantidad || payment.additional_info?.items?.[0]?.quantity || 1;
          const sector = metadata.sector || 'General';

          if (!eventoid || !usuarioid) {
            console.error('Missing required metadata in payment:', {
              paymentId: payment.id,
              metadata,
            });
            throw new Error('Missing required metadata');
          }

          // Obtener datos del usuario
          const usuario = await tx.user.findUnique({
            where: { id: String(usuarioid) },
          });

          if (!usuario) {
            throw new Error('Usuario no encontrado');
          }

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

          // Obtener la primera fecha del evento y el sector correspondiente
          const fechaEvento = evento.fechas_evento[0];
          const categoriaEntrada =
            evento.stock_entrada.find(
              (s: any) => String(s.nombre).toLowerCase() === String(sector).toLowerCase(),
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
              cantidad: parseInt(String(cantidad)),
              estado: 'CONFIRMADA',
            },
          });

          // Crear pago
          const pago = await tx.pagos.create({
            data: {
              pagoid: randomUUID(),
              reservaid: reserva.reservaid,
              metodo_pago: 'mercado_pago',
              monto_total: new Prisma.Decimal(payment.transaction_amount || 0),
              estado: 'COMPLETADO',
              moneda: payment.currency_id || 'ARS',
            },
          });

          // Crear entradas con QR
          const entradas = [];
          const ticketsParaEmail: Array<{ codigo_qr: string; qrDataUrl: string }> = [];

          for (let i = 0; i < parseInt(String(cantidad)); i++) {
            const codigoQr = `${reserva.reservaid}-${Date.now()}-${i}`;

            // Generar código QR
            const qrDataUrl = await generateQRCode(codigoQr);

            const entrada = await tx.entradas.create({
              data: {
                entradaid: randomUUID(),
                reservaid: reserva.reservaid,
                codigo_qr: codigoQr,
                estado: 'VALIDA',
              },
            });

            entradas.push(entrada);
            ticketsParaEmail.push({
              codigo_qr: codigoQr,
              qrDataUrl,
            });
          }

          // Registrar movimiento de stock
          await tx.movimientos_entradas.create({
            data: {
              movimientoid: randomUUID(),
              stockid: categoriaEntrada.stockid,
              usuarioid: String(usuarioid),
              cantidad: parseInt(String(cantidad)),
              tipo: 'VENTA',
              fecha_mov: new Date(),
            },
          });

          // Registrar historial de compra
          const historialId = randomUUID();
          const montoTotalDecimal = new Prisma.Decimal(payment.transaction_amount || 0);

          await tx.$executeRaw`INSERT INTO historial_compras (
            id, usuarioid, reservaid, eventoid, cantidad, monto_total, moneda, estado_compra, fecha_compra, fecha_evento, comprobante_url
          ) VALUES (
            ${historialId}, 
            ${String(usuarioid)}, 
            ${reserva.reservaid}, 
            ${eventoid}, 
            ${parseInt(String(cantidad))}, 
            ${montoTotalDecimal}, 
            ${payment.currency_id || 'ARS'}, 
            ${'COMPLETADO'}, 
            ${new Date()}, 
            ${fechaEvento.fecha_hora as any}, 
            ${null}
          )`;

          return {
            reserva,
            pago,
            entradas,
            historialId,
            usuario,
            evento,
            ticketsParaEmail,
          };
        });

        // Enviar email con entradas DESPUÉS de la transacción
        try {
          await sendTicketEmail(
            resultado.usuario.email || resultado.usuario.name || 'cliente@example.com',
            resultado.usuario.name || 'Cliente',
            resultado.evento.titulo,
            resultado.ticketsParaEmail,
          );
        } catch (emailError) {
          console.error('Error sending ticket email:', emailError);
          // No fallar la transacción si el email falla
        }

        console.log('Mercado Pago payment processed successfully:', {
          paymentId: payment.id,
          reservaId: resultado.reserva.reservaid,
          pagoId: resultado.pago.pagoid,
          historialId: resultado.historialId,
          cantidadEntradas: resultado.entradas.length,
          montoTotal: payment.transaction_amount,
          moneda: payment.currency_id,
        });

        return NextResponse.json({
          received: true,
          paymentId: payment.id,
          reservaId: resultado.reserva.reservaid,
          historialId: resultado.historialId,
        });
      } catch (error) {
        console.error('Error processing Mercado Pago payment:', {
          paymentId: payment.id,
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
        });

        return NextResponse.json(
          {
            error: 'Failed to process payment',
            paymentId: payment.id,
            details: error instanceof Error ? error.message : 'Unknown error',
          },
          { status: 500 },
        );
      }
    }

    // Manejar otros tipos de eventos
    console.log(`Unhandled event type: ${event.type}`);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
