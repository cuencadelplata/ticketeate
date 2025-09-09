// url hono
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Endpoints de la API
export const API_ENDPOINTS = {
  events: `${API_BASE_URL}/api/events`,
  uploadImage: `${API_BASE_URL}/api/events/upload-image`,
} as const;

// Configuración de Cloudinary (para referencia)
export const CLOUDINARY_CONFIG = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
} as const;

