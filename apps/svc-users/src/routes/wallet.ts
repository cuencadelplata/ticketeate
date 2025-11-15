import { Hono, Context } from 'hono';
import { cors } from 'hono/cors';
import { config } from 'dotenv';
import { prisma } from '@repo/db';

config();
export const wallet = new Hono();

// Helper function to get JWT payload from context
function getJwtPayload(c: Context) {
  return c.get('jwtPayload');
}

// Almacenamiento simple en memoria para billeteras mock (solo para desarrollo)
const mockWallets = new Map<string, { wallet_linked: boolean; wallet_provider: string }>();

// Get wallet status
wallet.get('/', async (c) => {
  const jwtPayload = getJwtPayload(c);
  if (!jwtPayload?.id) {
    return c.json({ error: 'Usuario no autenticado' }, 401);
  }

  try {
    // Primero verificar si hay una billetera mock para este usuario
    const mockWallet = mockWallets.get(jwtPayload.id);
    if (mockWallet) {
      return c.json(mockWallet);
    }

    // Consultar la base de datos
    const user = await prisma.user.findUnique({
      where: { id: jwtPayload.id },
      select: {
        wallet_linked: true,
        wallet_provider: true,
      },
    });

    if (!user) {
      return c.json({ error: 'Usuario no encontrado' }, 404);
    }

    return c.json({
      wallet_linked: user.wallet_linked || false,
      wallet_provider: user.wallet_provider || null,
    });
  } catch (error) {
    console.error('Error obteniendo estado de billetera:', error);
    return c.json({ error: 'Error al obtener estado de billetera' }, 500);
  }
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
      // Para Mercado Pago real, debería ser manejado por el callback
      // Este endpoint no debería ser llamado para mercado_pago real
      // El flujo real es: OAuth redirect -> callback que actualiza la DB
      return c.json({ error: 'Usa el flujo OAuth para vincular Mercado Pago' }, 400);
    }
  } catch (error) {
    console.error('Error al vincular billetera:', error);
    return c.json({ error: 'Error al procesar la solicitud' }, 400);
  }
});

// Unlink wallet
wallet.post('/unlink', async (c) => {
  const jwtPayload = getJwtPayload(c);
  if (!jwtPayload?.id) {
    return c.json({ error: 'Usuario no autenticado' }, 401);
  }

  try {
    // Si es una billetera mock, eliminarla del almacenamiento en memoria
    if (mockWallets.has(jwtPayload.id)) {
      mockWallets.delete(jwtPayload.id);
      return c.json({
        wallet_linked: false,
        wallet_provider: null,
      });
    }

    // Para billeteras reales en la base de datos
    const user = await prisma.user.update({
      where: { id: jwtPayload.id },
      data: {
        wallet_linked: false,
        wallet_provider: null,
        mercado_pago_user_id: null,
        mercado_pago_access_token: null,
        mercado_pago_refresh_token: null,
        mercado_pago_token_expires_at: null,
      },
      select: {
        wallet_linked: true,
        wallet_provider: true,
      },
    });

    return c.json({
      wallet_linked: user.wallet_linked || false,
      wallet_provider: user.wallet_provider || null,
    });
  } catch (error) {
    console.error('Error al desvincular billetera:', error);
    return c.json({ error: 'Error al desvincular billetera' }, 500);
  }
});

// Confirm wallet link (called from callback)
wallet.post('/confirm-link', async (c) => {
  const jwtPayload = getJwtPayload(c);
  if (!jwtPayload?.id) {
    return c.json({ error: 'Usuario no autenticado' }, 401);
  }

  try {
    const body = await c.req.json();
    const { wallet_provider } = body;

    if (wallet_provider !== 'mercado_pago') {
      return c.json({ error: 'Proveedor de billetera no válido' }, 400);
    }

    // Simplemente confirmar que la billetera fue vinculada
    const user = await prisma.user.findUnique({
      where: { id: jwtPayload.id },
      select: {
        wallet_linked: true,
        wallet_provider: true,
      },
    });

    if (!user) {
      return c.json({ error: 'Usuario no encontrado' }, 404);
    }

    return c.json({
      success: true,
      wallet_linked: user.wallet_linked,
      wallet_provider: user.wallet_provider,
    });
  } catch (error) {
    console.error('Error confirmando vinculación de billetera:', error);
    return c.json({ error: 'Error al confirmar vinculación' }, 500);
  }
});

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
      message: 'Pago simulado exitosamente',
    });
  } catch (error) {
    return c.json({ error: 'Error al procesar el pago simulado' }, 400);
  }
});
