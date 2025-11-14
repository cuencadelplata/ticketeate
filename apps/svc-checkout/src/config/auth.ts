// Public endpoints that don't require authentication
// Note: svc-checkout only has protected endpoints (users, checkout)
// All API calls to this service require authentication
export const PUBLIC_ENDPOINTS = [
  '/health',
  '/production/health',
  '/cors-debug',
  '/production/cors-debug',
];
