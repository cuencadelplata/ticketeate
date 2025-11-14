import jsQR, { QRCode } from 'jsqr';

export interface QRDecoderResult {
  data: string;
  location: QRCode['location'];
}

export function decodeQR(imageData: ImageData): QRDecoderResult | null {
  const decodedQR = jsQR(imageData.data, imageData.width, imageData.height);
  if (decodedQR) {
    return {
      data: decodedQR.data,
      location: decodedQR.location,
    };
  }
  return null;
}

export function isValidQRFormat(data: string): boolean {
  // Basic validation: QR code should contain ticket ID format
  return data.length > 5 && /^[a-zA-Z0-9-_]+$/.test(data);
}

export function extractTicketId(qrData: string): string {
  // Extract ticket ID from QR data
  const parts = qrData.split('|');
  return parts[0] || qrData;
}
