// Public endpoints that don't require authentication
// Note: svc-producers only has protected endpoints (producer events)
// All API calls to this service require authentication
export const PUBLIC_ENDPOINTS = [
  '/health',
  '/production/health',
  '/cors-debug',
  '/production/cors-debug',
];
