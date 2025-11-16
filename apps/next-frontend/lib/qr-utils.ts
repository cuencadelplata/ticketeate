import * as crypto from 'crypto';

/**
 * Genera un código único para QR
 */
export function generateQRCode(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Crea los datos del QR en formato JSON
 */
export function createQRData(params: {
  inscripcionid: string;
  eventoid: string;
  codigo: string;
  nombre: string;
  correo: string;
}): string {
  return JSON.stringify({
    inscripcionid: params.inscripcionid,
    eventoid: params.eventoid,
    codigo: params.codigo,
    nombre: params.nombre,
    correo: params.correo,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Genera un data URL de QR usando qr-code.js
 * Devuelve la URL para generar el QR con una API externa
 */
export function getQRCodeURL(data: string): string {
  const encoded = encodeURIComponent(data);
  // Usar QR Code API gratuita
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encoded}`;
}
