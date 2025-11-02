/**
 * Ticket Generator Service
 * 
 * Servicio para generar QR codes y PDFs de entradas
 * Separado del contexto para reutilización y testing
 */

import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';

export interface TicketData {
  reservaId: string;
  eventTitle: string;
  eventLocation?: string;
  eventDate?: string;
  eventImageUrl?: string;
  sector: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  metodo: string;
  userEmail?: string;
  userName?: string;
}

export interface QRCodeData {
  reservaId: string;
  eventId?: string;
  userId?: string;
  sector: string;
  cantidad: number;
}

/**
 * Generar QR code como data URL
 */
export async function generateQRCode(data: QRCodeData): Promise<string> {
  const qrPayload = JSON.stringify({
    type: 'ticket',
    reservaId: data.reservaId,
    eventId: data.eventId,
    userId: data.userId,
    sector: data.sector,
    cantidad: data.cantidad,
    timestamp: Date.now(),
  });

  const qrDataUrl = await QRCode.toDataURL(qrPayload, {
    errorCorrectionLevel: 'H', // High error correction
    margin: 2,
    width: 512, // Alta resolución para email
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });

  return qrDataUrl;
}

/**
 * Generar QR code como buffer (para adjuntar a emails)
 */
export async function generateQRCodeBuffer(data: QRCodeData): Promise<Buffer> {
  const qrPayload = JSON.stringify({
    type: 'ticket',
    reservaId: data.reservaId,
    eventId: data.eventId,
    userId: data.userId,
    sector: data.sector,
    cantidad: data.cantidad,
    timestamp: Date.now(),
  });

  const buffer = await QRCode.toBuffer(qrPayload, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 512,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });

  return buffer;
}

/**
 * Generar PDF de comprobante (para descarga opcional)
 */
export async function generateTicketPDF(ticket: TicketData): Promise<Blob> {
  const qrDataUrl = await generateQRCode({
    reservaId: ticket.reservaId,
    sector: ticket.sector,
    cantidad: ticket.cantidad,
  });

  // Convertir imagen del evento a data URL
  const eventImgDataUrl = ticket.eventImageUrl
    ? await imageToDataUrl(ticket.eventImageUrl)
    : '';

  const pdf = new jsPDF('p', 'mm', 'a4');
  pdf.setFont('helvetica', 'normal');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Card background
  const cardWidth = Math.min(180, pageWidth - 20);
  const cardHeight = 220;
  const cardX = (pageWidth - cardWidth) / 2;
  const cardY = (pageHeight - cardHeight) / 2;

  pdf.setFillColor(236, 252, 240);
  pdf.setDrawColor(199, 230, 204);
  pdf.roundedRect(cardX, cardY, cardWidth, cardHeight, 4, 4, 'FD');

  // Title
  let cursorY = cardY + 14;
  pdf.setTextColor(22, 101, 52);
  pdf.setFontSize(20);
  const title = '¡Compra Exitosa!';
  const titleWidth = pdf.getTextWidth(title);
  pdf.text(title, cardX + (cardWidth - titleWidth) / 2, cursorY, { baseline: 'middle' });

  // Event image
  if (eventImgDataUrl) {
    const imgMargin = 10;
    const imgW = cardWidth - imgMargin * 2;
    const imgH = 40;
    pdf.addImage(
      eventImgDataUrl,
      'PNG',
      cardX + imgMargin,
      cursorY + 6,
      imgW,
      imgH,
      undefined,
      'FAST'
    );
    cursorY += 6 + imgH;
  }

  // QR Code
  const qrSize = 60;
  pdf.addImage(
    qrDataUrl,
    'PNG',
    cardX + (cardWidth - qrSize) / 2,
    cursorY + 10,
    qrSize,
    qrSize,
    undefined,
    'FAST'
  );
  cursorY += 10 + qrSize + 10;

  // Details
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(12);
  const left = cardX + 12;

  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(ticket.eventTitle, left, cursorY);
  cursorY += 10;

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');

  if (ticket.eventLocation) {
    pdf.text(`📍 ${ticket.eventLocation}`, left, cursorY);
    cursorY += 8;
  }

  if (ticket.eventDate) {
    pdf.text(`📅 ${ticket.eventDate}`, left, cursorY);
    cursorY += 8;
  }

  cursorY += 4;
  pdf.setDrawColor(200, 200, 200);
  pdf.line(left, cursorY, cardX + cardWidth - 12, cursorY);
  cursorY += 8;

  pdf.text(`Sector: ${ticket.sector}`, left, cursorY);
  cursorY += 8;
  pdf.text(`Cantidad: ${ticket.cantidad} entrada(s)`, left, cursorY);
  cursorY += 8;
  pdf.text(`Precio unitario: $${ticket.precioUnitario.toFixed(2)}`, left, cursorY);
  cursorY += 8;
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Total: $${ticket.total.toFixed(2)}`, left, cursorY);
  pdf.setFont('helvetica', 'normal');
  cursorY += 8;
  pdf.text(`Método de pago: ${ticket.metodo}`, left, cursorY);
  cursorY += 12;

  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`ID de Reserva: ${ticket.reservaId}`, left, cursorY);

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(120, 120, 120);
  const footerText = 'Conserva este comprobante para ingresar al evento';
  const footerWidth = pdf.getTextWidth(footerText);
  pdf.text(footerText, cardX + (cardWidth - footerWidth) / 2, cardY + cardHeight - 8);

  // Convertir a Blob
  const pdfBlob = pdf.output('blob');
  return pdfBlob;
}

/**
 * Helper: Convertir imagen URL a data URL
 */
async function imageToDataUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to data URL:', error);
    return '';
  }
}

/**
 * Descargar PDF en el navegador
 */
export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
