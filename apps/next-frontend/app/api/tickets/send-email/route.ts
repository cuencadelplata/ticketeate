import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { generateQRCodeBuffer } from '@/lib/services/ticket-generator';
import type { TicketData } from '@/lib/services/ticket-generator';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendTicketEmailRequest {
  to: string;
  userName?: string;
  ticketData: TicketData;
}

/**
 * POST /api/tickets/send-email
 * Enviar comprobante de entrada por email con QR code
 */
export async function POST(request: NextRequest) {
  try {
    const body: SendTicketEmailRequest = await request.json();
    const { to, userName, ticketData } = body;

    if (!to || !ticketData) {
      return NextResponse.json(
        { error: 'Missing required fields: to, ticketData' },
        { status: 400 }
      );
    }

    // Generar QR code
    const qrBuffer = await generateQRCodeBuffer({
      reservaId: ticketData.reservaId,
      eventId: ticketData.eventTitle, // TODO: Pasar eventId real
      sector: ticketData.sector,
      cantidad: ticketData.cantidad,
    });

    // Convertir buffer a base64 para inline attachment
    const qrBase64 = qrBuffer.toString('base64');

    // Enviar email con Resend
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'TicketEate <tickets@ticketeate.com>',
      to: [to],
      subject: `🎉 Tu entrada para ${ticketData.eventTitle}`,
      html: generateEmailHTML(userName || 'Usuario', ticketData),
      attachments: [
        {
          filename: `entrada-${ticketData.reservaId}.png`,
          content: qrBase64,
          contentType: 'image/png',
        },
      ],
      tags: [
        {
          name: 'category',
          value: 'ticket-purchase',
        },
      ],
    });

    if (error) {
      console.error('[SendTicketEmail] Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`[SendTicketEmail] Email sent successfully: ${data?.id}`);

    return NextResponse.json({
      success: true,
      emailId: data?.id,
      message: 'Ticket email sent successfully',
    });
  } catch (error: any) {
    console.error('[SendTicketEmail] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Generar HTML del email con estilos inline
 */
function generateEmailHTML(userName: string, ticket: TicketData): string {
  const qrCid = `entrada-${ticket.reservaId}.png`;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu Entrada - TicketEate</title>
</head>
<body style="
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f5f5;
  color: #333333;
">
  <!-- Contenedor principal -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Card del ticket -->
        <table width="600" cellpadding="0" cellspacing="0" style="
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        ">
          <!-- Header con gradiente -->
          <tr>
            <td style="
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px 30px;
              text-align: center;
            ">
              <h1 style="
                margin: 0;
                color: #ffffff;
                font-size: 32px;
                font-weight: 700;
              ">
                🎉 ¡Tu Entrada está Lista!
              </h1>
              <p style="
                margin: 12px 0 0 0;
                color: rgba(255, 255, 255, 0.95);
                font-size: 16px;
              ">
                Hola ${userName}, prepárate para vivir una experiencia increíble
              </p>
            </td>
          </tr>

          <!-- Contenido -->
          <tr>
            <td style="padding: 40px 30px;">
              <!-- Título del evento -->
              <h2 style="
                margin: 0 0 24px 0;
                color: #1a202c;
                font-size: 24px;
                font-weight: 600;
              ">
                ${ticket.eventTitle}
              </h2>

              <!-- Detalles del evento -->
              ${ticket.eventLocation ? `
              <p style="margin: 0 0 12px 0; color: #4a5568; font-size: 16px;">
                <strong style="color: #2d3748;">📍 Ubicación:</strong> ${ticket.eventLocation}
              </p>
              ` : ''}

              ${ticket.eventDate ? `
              <p style="margin: 0 0 12px 0; color: #4a5568; font-size: 16px;">
                <strong style="color: #2d3748;">📅 Fecha:</strong> ${ticket.eventDate}
              </p>
              ` : ''}

              <p style="margin: 0 0 12px 0; color: #4a5568; font-size: 16px;">
                <strong style="color: #2d3748;">🎫 Sector:</strong> ${ticket.sector}
              </p>

              <p style="margin: 0 0 24px 0; color: #4a5568; font-size: 16px;">
                <strong style="color: #2d3748;">👥 Cantidad:</strong> ${ticket.cantidad} entrada(s)
              </p>

              <!-- Separador -->
              <hr style="
                border: none;
                border-top: 1px solid #e2e8f0;
                margin: 24px 0;
              ">

              <!-- QR Code -->
              <div style="text-align: center; margin: 32px 0;">
                <p style="
                  margin: 0 0 16px 0;
                  color: #2d3748;
                  font-size: 18px;
                  font-weight: 600;
                ">
                  Escanea este código en la entrada
                </p>
                <img 
                  src="cid:${qrCid}" 
                  alt="QR Code de tu entrada"
                  style="
                    max-width: 256px;
                    width: 100%;
                    height: auto;
                    border: 4px solid #e2e8f0;
                    border-radius: 12px;
                  "
                >
                <p style="
                  margin: 16px 0 0 0;
                  color: #718096;
                  font-size: 14px;
                ">
                  ID de Reserva: <strong>${ticket.reservaId}</strong>
                </p>
              </div>

              <!-- Separador -->
              <hr style="
                border: none;
                border-top: 1px solid #e2e8f0;
                margin: 24px 0;
              ">

              <!-- Resumen de compra -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
                <tr>
                  <td style="padding: 8px 0; color: #4a5568; font-size: 15px;">
                    Precio por entrada
                  </td>
                  <td align="right" style="padding: 8px 0; color: #2d3748; font-size: 15px;">
                    $${ticket.precioUnitario.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #4a5568; font-size: 15px;">
                    Cantidad
                  </td>
                  <td align="right" style="padding: 8px 0; color: #2d3748; font-size: 15px;">
                    ${ticket.cantidad}
                  </td>
                </tr>
                <tr style="background-color: #f7fafc;">
                  <td style="padding: 12px; color: #1a202c; font-size: 18px; font-weight: 600; border-radius: 6px;">
                    Total
                  </td>
                  <td align="right" style="padding: 12px; color: #1a202c; font-size: 18px; font-weight: 600; border-radius: 6px;">
                    $${ticket.total.toFixed(2)}
                  </td>
                </tr>
              </table>

              <!-- Método de pago -->
              <p style="margin: 16px 0 0 0; color: #718096; font-size: 14px;">
                Método de pago: <strong>${formatPaymentMethod(ticket.metodo)}</strong>
              </p>
            </td>
          </tr>

          <!-- Footer con instrucciones -->
          <tr>
            <td style="
              background-color: #f7fafc;
              padding: 30px;
              border-top: 1px solid #e2e8f0;
            ">
              <h3 style="
                margin: 0 0 16px 0;
                color: #2d3748;
                font-size: 18px;
                font-weight: 600;
              ">
                📋 Instrucciones Importantes
              </h3>
              <ul style="
                margin: 0;
                padding-left: 20px;
                color: #4a5568;
                font-size: 14px;
                line-height: 1.6;
              ">
                <li style="margin-bottom: 8px;">
                  <strong>Conserva este email</strong> - Lo necesitarás para ingresar al evento
                </li>
                <li style="margin-bottom: 8px;">
                  <strong>Llega con tiempo</strong> - Recomendamos llegar 30 minutos antes
                </li>
                <li style="margin-bottom: 8px;">
                  <strong>Presenta tu QR</strong> - Puede ser en tu celular o impreso
                </li>
                <li style="margin-bottom: 8px;">
                  <strong>Documento de identidad</strong> - Lleva tu DNI o identificación oficial
                </li>
              </ul>
            </td>
          </tr>

          <!-- Footer branding -->
          <tr>
            <td style="
              background-color: #1a202c;
              padding: 24px 30px;
              text-align: center;
            ">
              <p style="
                margin: 0 0 8px 0;
                color: rgba(255, 255, 255, 0.9);
                font-size: 16px;
                font-weight: 600;
              ">
                TicketEate
              </p>
              <p style="
                margin: 0;
                color: rgba(255, 255, 255, 0.6);
                font-size: 13px;
              ">
                Tu plataforma de eventos favorita
              </p>
            </td>
          </tr>
        </table>

        <!-- Footer legal -->
        <p style="
          margin: 24px 0 0 0;
          color: #718096;
          font-size: 12px;
          text-align: center;
          max-width: 600px;
        ">
          Este email contiene información confidencial. Si lo recibiste por error, 
          por favor elimínalo y notifica al remitente.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Formatear método de pago para mostrar
 */
function formatPaymentMethod(metodo: string): string {
  const methods: Record<string, string> = {
    'tarjeta_credito': 'Tarjeta de Crédito',
    'tarjeta_debito': 'Tarjeta de Débito',
    'mercado_pago': 'Mercado Pago',
    'stripe': 'Stripe',
  };

  return methods[metodo] || metodo;
}
