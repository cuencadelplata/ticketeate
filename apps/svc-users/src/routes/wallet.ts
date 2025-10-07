import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { config } from 'dotenv';
import { WalletService } from '../services/wallet-service';

config();
export const wallet = new Hono();

// Almacenamiento simple en memoria para billeteras mock (solo para desarrollo)
const mockWallets = new Map<string, { wallet_linked: boolean; wallet_provider: string }>();

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

// Middleware simple para extraer el token
wallet.use('*', async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // Por ahora, usamos el token como userId temporalmente
    // En una implementación real, deberías validar el token
    c.set('userId', token);
  }
  await next();
});

// Get wallet status
wallet.get('/', async (c) => {
  const userId = c.get('userId');
  if (!userId) return c.json({ error: 'Usuario no autenticado' }, 401);

  // Verificar si hay una billetera mock para este usuario
  const mockWallet = mockWallets.get(userId);
  if (mockWallet) {
    return c.json(mockWallet);
  }

  // Si no hay billetera mock, retornar estado por defecto
  return c.json({
    wallet_linked: false,
    wallet_provider: null
  });
});

// Link wallet (Mercado Pago real o mock)
wallet.post('/link', async (c) => {
  const userId = c.get('userId');
  if (!userId) return c.json({ error: 'Usuario no autenticado' }, 401);

  try {
    const body = await c.req.json();
    const provider = body.provider || 'mercado_pago';
    
    if (provider === 'mock') {
      // Para simulación, almacenar en memoria
      const mockWallet = {
        wallet_linked: true,
        wallet_provider: 'mock'
      };
      mockWallets.set(userId, mockWallet);
      return c.json(mockWallet);
    } else {
      // Para Mercado Pago real, aquí iría la lógica de OAuth
      return c.json({
        wallet_linked: true,
        wallet_provider: 'mercado_pago'
      });
    }
  } catch (error) {
    return c.json({ error: 'Error al procesar la solicitud' }, 400);
  }
});

// Unlink wallet
wallet.post('/unlink', async (c) => {
  const userId = c.get('userId');
  if (!userId) return c.json({ error: 'Usuario no autenticado' }, 401);

  // Si es una billetera mock, eliminarla del almacenamiento en memoria
  if (mockWallets.has(userId)) {
    mockWallets.delete(userId);
    return c.json({
      wallet_linked: false,
      wallet_provider: null
    });
  }

  // Para billeteras reales, aquí iría la lógica de desvinculación
  return c.json({
    wallet_linked: false,
    wallet_provider: null
  });
});

// Endpoint para simular pagos (solo para desarrollo)
wallet.post('/simulate-payment', async (c) => {
  const userId = c.get('userId');
  if (!userId) return c.json({ error: 'Usuario no autenticado' }, 401);

  try {
    const body = await c.req.json();
    const { amount, eventId, ticketCount } = body;
    
    // Verificar que el usuario tenga una billetera mock vinculada
    const mockWallet = mockWallets.get(userId);
    if (!mockWallet || mockWallet.wallet_provider !== 'mock') {
      return c.json({ error: 'Billetera mock no vinculada' }, 400);
    }

    // Simular procesamiento de pago (siempre exitoso en modo mock)
    const paymentId = `mock_payment_${Date.now()}`;
    
    return c.json({
      success: true,
      paymentId,
      status: 'completed',
      amount,
      eventId,
      ticketCount,
      message: 'Pago simulado exitosamente'
    });
  } catch (error) {
    return c.json({ error: 'Error al procesar el pago simulado' }, 400);
  }
});