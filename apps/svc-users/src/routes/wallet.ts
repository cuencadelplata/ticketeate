import { Hono, Context } from 'hono';
import { cors } from 'hono/cors';
import { config } from 'dotenv';

config();
export const wallet = new Hono();

// Helper function to get JWT payload from context
function getJwtPayload(c: Context) {
  return c.get('jwtPayload');
}

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

// Get wallet status
wallet.get('/', async (c) => {
  const jwtPayload = getJwtPayload(c);
  if (!jwtPayload?.id) {
    return c.json({ error: 'Usuario no autenticado' }, 401);
  }

  // Verificar si hay una billetera mock para este usuario
  const mockWallet = mockWallets.get(jwtPayload.id);
  if (mockWallet) {
    return c.json(mockWallet);
  }

  // Si no hay billetera mock, retornar estado por defecto
  return c.json({
    wallet_linked: false,
    wallet_provider: null,
  });
});

// Link wallet (Mercado Pago real o mock)
wallet.post('/link', async (c) => {
  const jwtPayload = getJwtPayload(c);
  if (!jwtPayload?.id) {
    return c.json({ error: 'Usuario no autenticado' }, 401);
  }

  try {
    const body = await c.req.json();
    const provider = body.provider || 'mercado_pago';

    if (provider === 'mock') {
      // Para simulación, almacenar en memoria
      const mockWallet = {
        wallet_linked: true,
        wallet_provider: 'mock',
      };
      mockWallets.set(jwtPayload.id, mockWallet);
      return c.json(mockWallet);
    } else {
      // Para Mercado Pago real, aquí iría la lógica de OAuth
      return c.json({
        wallet_linked: true,
        wallet_provider: 'mercado_pago',
      });
    }
  } catch (error) {
    // Log the error for debugging
    // eslint-disable-next-line no-console
    console.error(error);
    return c.json({ error: 'Error al procesar la solicitud' }, 400);
  }
});

// Unlink wallet
wallet.post('/unlink', async (c) => {
  const jwtPayload = getJwtPayload(c);
  if (!jwtPayload?.id) {
    return c.json({ error: 'Usuario no autenticado' }, 401);
  }

  // Si es una billetera mock, eliminarla del almacenamiento en memoria
  if (mockWallets.has(jwtPayload.id)) {
    mockWallets.delete(jwtPayload.id);
    return c.json({
      wallet_linked: false,
      wallet_provider: null,
    });
  }

  // Para billeteras reales, aquí iría la lógica de desvinculación
  return c.json({
    wallet_linked: false,
    wallet_provider: null,
  });
});

// Endpoint para simular pagos (solo para desarrollo)
wallet.post('/simulate-payment', async (c) => {
  const jwtPayload = getJwtPayload(c);
  if (!jwtPayload?.id) {
    return c.json({ error: 'Usuario no autenticado' }, 401);
  }

  try {
    const body = await c.req.json();
    const { amount, eventId, ticketCount } = body;

    // Verificar que el usuario tenga una billetera mock vinculada
    const mockWallet = mockWallets.get(jwtPayload.id);
    if (mockWallet?.wallet_provider !== 'mock') {
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
      message: 'Pago simulado exitosamente',
    });
  } catch (error) {
    // Log the error for debugging
    // eslint-disable-next-line no-console
    console.error(error);
    return c.json({ error: 'Error al procesar el pago simulado' }, 400);
  }
});
