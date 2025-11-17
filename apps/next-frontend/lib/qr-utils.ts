import * as crypto from 'crypto';

/**
 * Genera un código único para QR
 */
export function generateQRCode(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Genera un data URL de QR usando una API pública
 */
export function getQRCodeURL(data: string): string {
  const encoded = encodeURIComponent(data);
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encoded}`;
}
