// url hono
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
export const USERS_API_BASE_URL = process.env.NEXT_PUBLIC_USERS_API_URL || API_BASE_URL;

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

// Configuración de Cloudinary (para referencia)
export const CLOUDINARY_CONFIG = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
} as const;

