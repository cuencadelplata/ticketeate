import { handle } from 'hono/aws-lambda';
import app from './index';

// Wrapper to ensure credentials header
const honoHandler = handle(app);

export const handler = async (event: any, context: any) => {
  const response = await honoHandler(event, context);

  // Ensure credentials header is always set if CORS origin is present
  if (response.headers && event.headers?.origin) {
    const allowedOrigins = [
      'https://ticketeate.com.ar',
      'https://www.ticketeate.com.ar',
      'http://localhost:3000',
      'http://localhost:3001',
    ];

    if (allowedOrigins.includes(event.headers.origin)) {
      response.headers['Access-Control-Allow-Credentials'] = 'true';
    }
  }

  return response;
};
