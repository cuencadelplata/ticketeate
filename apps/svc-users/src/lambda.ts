import { handle } from 'hono/aws-lambda';
import app from './index';

const honoHandler = handle(app);

export const handler = async (event: any, context: any) => {
  const response = await honoHandler(event, context);

  // Agregar headers CORS a todas las respuestas
  const origin = event.headers?.origin || event.headers?.Origin;
  const allowedOrigins = [
    'https://ticketeate.com.ar',
    'https://www.ticketeate.com.ar',
    'http://localhost:3000',
  ];

  if (origin && allowedOrigins.includes(origin)) {
    response.headers = response.headers || {};
    response.headers['Access-Control-Allow-Origin'] = origin;
    response.headers['Access-Control-Allow-Credentials'] = 'true';
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
    response.headers['Access-Control-Allow-Headers'] = '*';
    response.headers['Access-Control-Expose-Headers'] = '*';
  }

  return response;
};
