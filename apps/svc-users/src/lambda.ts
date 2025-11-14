import { handle } from 'hono/aws-lambda';
import app from './index';

// Wrapper to ensure CORS headers are properly set for API Gateway v2
const honoHandler = handle(app);

export const handler = async (event: any, context: any) => {
  // Handle OPTIONS requests (preflight)
  if (event.requestContext.http.method === 'OPTIONS') {
    const origin = event.headers?.origin || event.headers?.Origin;
    const allowedOrigins = [
      'https://ticketeate.com.ar',
      'https://www.ticketeate.com.ar',
      'http://localhost:3000',
      'http://localhost:3001',
    ];

    return {
      statusCode: 204,
      headers: {
        // API Gateway v2 REQUIRES lowercase header names
        'access-control-allow-origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
        'access-control-allow-credentials': 'true',
        'access-control-allow-headers': 'content-type,authorization',
        'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        'access-control-max-age': '600',
      },
    };
  }

  // Handle regular requests
  const response: any = await honoHandler(event, context);

  // CRITICAL: Force CORS headers in response (API Gateway v2 filters uppercase headers)
  const origin = event.headers?.origin || event.headers?.Origin;
  const allowedOrigins = [
    'https://ticketeate.com.ar',
    'https://www.ticketeate.com.ar',
    'http://localhost:3000',
    'http://localhost:3001',
  ];

  // Ensure headers object exists
  if (!response.headers) {
    response.headers = {};
  }

  // Set CORS headers with lowercase names (required by API Gateway v2)
  if (origin && allowedOrigins.includes(origin)) {
    response.headers['access-control-allow-origin'] = origin;
    response.headers['access-control-allow-credentials'] = 'true';
    response.headers['access-control-allow-headers'] = 'content-type,authorization';
    response.headers['access-control-allow-methods'] = 'GET,POST,PUT,PATCH,DELETE,OPTIONS';
  }

  return response;
};
