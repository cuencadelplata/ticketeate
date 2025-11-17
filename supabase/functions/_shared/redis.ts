import { Redis } from 'https://esm.sh/ioredis@5.3.2';

interface EnvRedisConfig {
  redisUrl?: string;
  host?: string;
  port?: string;
  password?: string;
  db?: string;
  tls?: string;
}

function readEnvConfig(): EnvRedisConfig {
  return {
    redisUrl: Deno.env.get('REDIS_URL') ?? undefined,
    host: Deno.env.get('REDIS_HOST') ?? undefined,
    port: Deno.env.get('REDIS_PORT') ?? undefined,
    password: Deno.env.get('REDIS_PASSWORD') ?? undefined,
    db: Deno.env.get('REDIS_DB') ?? undefined,
    tls: Deno.env.get('REDIS_TLS') ?? undefined,
  };
}

function resolveRedisUrl(): string {
  const env = readEnvConfig();

  if (env.redisUrl) {
    return env.redisUrl;
  }

  if (env.host) {
    const authPart = env.password ? `:${env.password}@` : '';
    const port = env.port || '6379';
    const protocol =
      env.tls?.toLowerCase() === 'true' || env.redisUrl?.startsWith('rediss://')
        ? 'rediss'
        : 'redis';
    return `${protocol}://${authPart}${env.host}:${port}`;
  }

  throw new Error('Redis connection environment variables are not configured');
}

export async function createRedisClient(): Promise<Redis> {
  const url = resolveRedisUrl();
  const redis = new Redis(url);
  return redis;
}

export async function withRedisClient<T>(handler: (client: Redis) => Promise<T>): Promise<T> {
  const client = await createRedisClient();
  try {
    return await handler(client);
  } finally {
    client.disconnect();
  }
}

export type { Redis };
