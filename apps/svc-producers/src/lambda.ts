import { handle } from 'hono/aws-lambda';
import app from './index';

// Wrapper to ensure CORS headers are properly set for API Gateway v2
const honoHandler = handle(app);

const ALLOWED_ORIGINS = [
  'https://ticketeate.com.ar',
  'https://www.ticketeate.com.ar',
  'http://localhost:3000',
  'http://localhost:3001',
];

function corsHeaders(origin: string | undefined) {
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
    return {};
  }

  return {
    'access-control-allow-origin': origin,
    'access-control-allow-credentials': 'true',
    'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'access-control-allow-headers': 'content-type,authorization',
  };
}

export const handler = async (event: any, context: any) => {
  const origin = event.headers?.origin || event.headers?.Origin;
  const method = event.requestContext.http.method;

  // eslint-disable-next-line no-console
  console.log(
    `[CORS] Method: ${method}, Origin: ${origin}, Allowed: ${ALLOWED_ORIGINS.includes(origin)}`,
  );

  // Handle OPTIONS preflight requests
  if (method === 'OPTIONS') {
    // eslint-disable-next-line no-console
    console.log('[CORS] Returning OPTIONS response');
    return {
      statusCode: 204,
      headers: {
        ...corsHeaders(origin),
        'access-control-max-age': '600',
      },
    };
  }

  // Handle regular requests through Hono
  const response = (await honoHandler(event, context)) as Record<string, any>;

  // eslint-disable-next-line no-console
  console.log(`[CORS] Response status: ${response.statusCode}`);

  // Ensure headers object exists and is a plain object (not Map)
  if (
    !response.headers ||
    typeof response.headers !== 'object' ||
    typeof response.headers.entries !== 'function'
  ) {
    response.headers = {};
  }

  // Add CORS headers to response
  const cors = corsHeaders(origin);
  response.headers = {
    ...response.headers,
    ...cors,
  };

  // eslint-disable-next-line no-console
  console.log(`[CORS] Final headers keys: ${Object.keys(response.headers).join(', ')}`);

  return response;
};
