import { handle } from 'hono/aws-lambda';
import { Context as AWSContext } from 'aws-lambda';
import app from './index';

const honoHandler = handle(app);

export const handler = async (event: Parameters<typeof honoHandler>[0], context: AWSContext) => {
  return honoHandler(event, context);
};
