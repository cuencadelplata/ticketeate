// Public endpoints that don't require authentication
export const PUBLIC_ENDPOINTS = [
  // Health checks
  '/health',
  '/production/health',
  // Public API endpoints
  '/api/events/all', // Get all public events
  '/api/events/public', // Get event by id (public) - matches /api/events/public/*
  '/production/api/events/all', // Production path
  '/production/api/events/public', // Production path - matches /production/api/events/public/*
];
