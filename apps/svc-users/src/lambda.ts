import { handle } from 'hono/aws-lambda';
import app from './index';

const honoHandler = handle(app);

export const handler = async (event: any, context: any) => {
  // Log raw event for debugging
  console.log(
    '[lambda.handler DEBUG] event.headers keys:',
    Object.keys(event.headers || {}).join(','),
  );
  console.log(
    '[lambda.handler DEBUG] Authorization header:',
    event.headers?.authorization || event.headers?.Authorization || 'NOT FOUND',
  );

  const response = await honoHandler(event, context);

  // Agregar headers CORS a todas las respuestas
  const origin = event.headers?.origin || event.headers?.Origin;
  const allowedOrigins = [
    'https://ticketeate.com.ar',
    'https://www.ticketeate.com.ar',
    'http://localhost:3000',
  ];

  // Convertir response a un objeto con headers mutables si es necesario
  const modifiedResponse = {
    ...response,
    headers: {
      ...(response.headers instanceof Map
        ? Object.fromEntries(response.headers)
        : response.headers || {}),
    },
  };

  if (origin && allowedOrigins.includes(origin)) {
    modifiedResponse.headers['Access-Control-Allow-Origin'] = origin;
    modifiedResponse.headers['Access-Control-Allow-Credentials'] = 'true';
    modifiedResponse.headers['Access-Control-Allow-Methods'] =
      'GET, POST, PUT, DELETE, PATCH, OPTIONS';
    modifiedResponse.headers['Access-Control-Allow-Headers'] =
      'Authorization, Content-Type, X-Requested-With, Cookie';
    modifiedResponse.headers['Access-Control-Expose-Headers'] = 'Content-Type, X-Total-Count';
  }

  return modifiedResponse;
};
