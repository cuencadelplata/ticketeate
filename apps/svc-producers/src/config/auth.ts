// API Key for frontend authentication
// This should be set via environment variable in production
export const FRONTEND_API_KEY = process.env.FRONTEND_API_KEY || 'dev-key-12345';

// List of public endpoints that don't require API key
export const PUBLIC_ENDPOINTS = ['/health', '/production/health', '/cors-debug', '/production/cors-debug'];
