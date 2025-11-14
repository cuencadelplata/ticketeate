import { handle } from 'hono/aws-lambda';
import app from './index';

// Wrapper to ensure credentials header
const honoHandler = handle(app);

export const handler = async (event: any, context: any) => {
  const response = await honoHandler(event, context);

  // CRITICAL: Ensure credentials header is ALWAYS present (lowercase for API Gateway v2)
  if (!response.headers) {
    response.headers = {};
  }

  // Check if origin is allowed
  const origin = event.headers?.origin || event.headers?.Origin;
  const allowedOrigins = [
    'https://ticketeate.com.ar',
    'https://www.ticketeate.com.ar',
    'http://localhost:3000',
    'http://localhost:3001',
  ];

  if (origin && allowedOrigins.includes(origin)) {
    // Force set the credentials header in lowercase (API Gateway v2 requirement)
    response.headers['access-control-allow-credentials'] = 'true';
  }

  return response;
};
