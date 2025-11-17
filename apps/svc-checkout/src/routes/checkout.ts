import { Hono, Context } from 'hono';
import { prisma } from '@repo/db';

export const checkout = new Hono();

// Helper function to get JWT payload from context
function getJwtPayload(c: Context) {
  return c.get('jwtPayload');
}

/**
 * GET /api/checkout/event/:eventId/categories
 * Obtiene las categorías de entradas disponibles para un evento
 */
checkout.get('/event/:eventId/categories', async (c) => {
  try {
    const eventId = c.req.param('eventId');

    if (!eventId) {
      return c.json({ error: 'Event ID is required' }, 400);
    }

    // Obtener las categorías de stock del evento
    const categories = await prisma.stock_entrada.findMany({
      where: {
        eventoid: eventId,
      },
      select: {
        stockid: true,
        nombre: true,
        precio: true,
        cant_max: true,
        fecha_limite: true,
      },
    });

    if (categories.length === 0) {
      return c.json(
        {
          error: 'No ticket categories found for this event',
          categories: [],
        },
        404,
      );
    }

    // Calcular stock disponible (cant_max - vendidas)
    // Por ahora retornamos cant_max, en prod deberías restar las reservas confirmadas
    const categoriesWithAvailable = categories.map((cat) => ({
      id: cat.stockid,
      name: cat.nombre,
      price: Number(cat.precio) / 100, // Convertir de centavos a pesos
      stock: cat.cant_max,
      available: cat.cant_max,
      expiration_date: cat.fecha_limite,
    }));

    return c.json({
      eventId,
      categories: categoriesWithAvailable,
      total_categories: categoriesWithAvailable.length,
    });
  } catch (error) {
    console.error('[Checkout] Error fetching categories:', error);
    return c.json(
      {
        error: 'Error fetching ticket categories',
        details: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

/**
 * GET /api/checkout/event/:eventId/stock
 * Obtiene el stock actual disponible para un evento
 */
checkout.get('/event/:eventId/stock', async (c) => {
  try {
    const eventId = c.req.param('eventId');

    if (!eventId) {
      return c.json({ error: 'Event ID is required' }, 400);
    }

    // Obtener el stock
    const stock = await prisma.stock_entrada.findMany({
      where: {
        eventoid: eventId,
      },
    });

    // Contar vendidas por categoría (reservas confirmadas)
    const sales = await prisma.reservas.groupBy({
      by: ['categoriaid'],
      where: {
        eventoid: eventId,
        estado: 'CONFIRMADA',
      },
      _sum: {
        cantidad: true,
      },
    });

    const salesMap = new Map(sales.map((s) => [s.categoriaid, s._sum.cantidad || 0]));

    const stockWithAvailable = stock.map((s) => ({
      id: s.stockid,
      name: s.nombre,
      price: Number(s.precio) / 100,
      total: s.cant_max,
      sold: salesMap.get(s.stockid) || 0,
      available: s.cant_max - (salesMap.get(s.stockid) || 0),
    }));

    return c.json({
      eventId,
      stock: stockWithAvailable,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Checkout] Error fetching stock:', error);
    return c.json(
      {
        error: 'Error fetching stock information',
        details: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

/**
 * POST /api/checkout/validate
 * Valida que el usuario pueda hacer checkout (wallet vinculada, etc)
 */
checkout.post('/validate', async (c) => {
  try {
    const jwtPayload = getJwtPayload(c);

    if (!jwtPayload?.id) {
      return c.json({ error: 'Not authenticated' }, 401);
    }

    const body = await c.req.json().catch(() => ({}));
    const { eventId } = body as { eventId?: string };

    if (!eventId) {
      return c.json({ error: 'Event ID is required' }, 400);
    }

    // Verificar que el evento existe
    const event = await prisma.eventos.findUnique({
      where: { eventoid: eventId },
      select: { creadorid: true },
    });

    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }

    // Verificar que el organizador tiene wallet vinculada
    const organizer = await prisma.user.findUnique({
      where: { id: event.creadorid },
      select: {
        wallet_linked: true,
        wallet_provider: true,
        mercado_pago_token_expires_at: true,
      },
    });

    if (!organizer || !organizer.wallet_linked) {
      return c.json(
        {
          error: 'Organizer has not linked their payment wallet',
          code: 'WALLET_NOT_LINKED',
        },
        402,
      );
    }

    // Verificar si el token está expirado
    if (organizer.mercado_pago_token_expires_at) {
      const now = new Date();
      const expiresAt = new Date(organizer.mercado_pago_token_expires_at);
      if (now > expiresAt) {
        return c.json(
          {
            error: 'Organizer wallet session expired',
            code: 'WALLET_EXPIRED',
          },
          402,
        );
      }
    }

    return c.json({
      valid: true,
      eventId,
      organizer: {
        id: event.creadorid,
        wallet_linked: true,
        wallet_provider: organizer.wallet_provider,
      },
    });
  } catch (error) {
    console.error('[Checkout] Error validating checkout:', error);
    return c.json(
      {
        error: 'Error validating checkout',
        details: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

/**
 * GET /api/checkout/health
 * Health check endpoint
 */
checkout.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'checkout-service',
    timestamp: new Date().toISOString(),
  });
});

export { checkout as checkoutRoutes };
