import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { config } from 'dotenv';
import { WalletService } from '../services/wallet-service';

config();
export const wallet = new Hono();

// CORS para permitir Authorization y cookies (credenciales)
wallet.use(
  '*',
  cors({
    origin: (origin) => origin ?? '*',
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Authorization', 'Content-Type', 'X-Requested-With'],
    exposeHeaders: ['*'],
    credentials: true,
    maxAge: 86400,
  }),
);

wallet.use(
  '*',
  clerkMiddleware({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  }),
);

// Get wallet status
wallet.get('/', async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) return c.json({ error: 'Usuario no autenticado' }, 401);

  const status = await WalletService.getWalletStatus(auth.userId);
  return c.json(status);
});

// Link mock wallet (e.g., Mercado Pago)
wallet.post('/link', async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) return c.json({ error: 'Usuario no autenticado' }, 401);

  const linked = await WalletService.linkWallet(auth.userId);
  return c.json(linked);
});

// Unlink wallet
wallet.post('/unlink', async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) return c.json({ error: 'Usuario no autenticado' }, 401);

  const unlinked = await WalletService.unlinkWallet(auth.userId);
  return c.json(unlinked);
});
