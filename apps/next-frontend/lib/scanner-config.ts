export const SCANNER_CONFIG = {
  VIDEO_CONSTRAINTS: {
    audio: false,
    video: {
      facingMode: 'environment',
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
  },
  SCAN_INTERVAL: 100,
  DECODE_ATTEMPTS: 3,
  DEBOUNCE_TIME: 500,
} as const;

export const SCANNER_MESSAGES = {
  PERMISSION_DENIED: 'Permiso denegado. Por favor, habilita el acceso a la cámara.',
  DEVICE_NOT_FOUND: 'No se encontró cámara en el dispositivo.',
  NOT_SUPPORTED: 'Tu navegador no soporta acceso a la cámara.',
  SCANNING: 'Escaneando...',
  VALIDATING: 'Validando ticket...',
  SUCCESS: 'Ticket validado exitosamente',
  ERROR: 'Error al validar el ticket',
  DUPLICATE: 'Este ticket ya fue validado',
  INVALID: 'Código QR inválido',
} as const;

export const PURCHASE_CONFIG = {
  PAGE_SIZE: 12,
  CACHE_TIME: 5 * 60 * 1000, // 5 minutes
  STALE_TIME: 1 * 60 * 1000, // 1 minute
} as const;

export const PURCHASE_MESSAGES = {
  LOADING: 'Cargando historial...',
  EMPTY: 'No hay compras disponibles',
  ERROR: 'Error al cargar el historial',
  NO_RESULTS: 'No se encontraron resultados',
} as const;
