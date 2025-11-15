import { handle } from 'hono/aws-lambda';
import app from './index';

const honoHandler = handle(app);

export const handler = async (event: any, context: any) => {
  return honoHandler(event, context);
};
