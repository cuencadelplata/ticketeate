// Función para detectar la URL base de la API según el contexto
function getApiBaseUrl(): string {
  // Si hay una variable de entorno configurada, usarla (para producción)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // En el servidor (SSR), usar localhost para desarrollo
  if (typeof window === 'undefined') {
    return 'http://localhost:3001';
  }

  // En el cliente, detectar si estamos usando una IP de red
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  // Si estamos en localhost, usar localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }

  // En producción, usar el mismo protocolo (HTTPS) y hostname del sitio
  return `${protocol}//${hostname}`;
}

// url hono
export const API_BASE_URL = getApiBaseUrl();
export const USERS_API_BASE_URL =
  process.env.NEXT_PUBLIC_USERS_API_URL || API_BASE_URL.replace(':3001', ':3003');

// Endpoints de la API
export const API_ENDPOINTS = {
  events: `${API_BASE_URL}/api/events`,
  uploadImage: `${API_BASE_URL}/api/events/upload-image`,
  allEvents: `${API_BASE_URL}/api/events/all`,
  publicEventById: (id: string) => `${API_BASE_URL}/api/events/public/${id}`,
  wallet: `${USERS_API_BASE_URL}/api/wallet`,
  walletLink: `${USERS_API_BASE_URL}/api/wallet/link`,
  walletUnlink: `${USERS_API_BASE_URL}/api/wallet/unlink`,
} as const;

// Configuración de Cloudinary
export const CLOUDINARY_CONFIG = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
} as const;

// Configuración de Redis (local con ioredis)
export const REDIS_CONFIG = {
  url: process.env.REDIS_URL || 'redis://default:localpassword@localhost:6379',
  token: process.env.REDIS_PASSWORD || process.env.REDIS_TOKEN,
} as const;
