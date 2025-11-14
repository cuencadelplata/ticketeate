import { Hono } from 'hono';
import { PurchasesService } from '../services/purchases-service';

const purchases = new Hono();

// GET /api/purchases
purchases.get('/', async (c) => {
  try {
    const userId = c.get('userId');
    if (!userId) {
      return c.json({ success: false, message: 'Unauthorized' }, 401);
    }

    const page = parseInt(c.req.query('page') || '1');
    const limit = Math.min(50, parseInt(c.req.query('limit') || '12'));
    const status = c.req.query('status');
    const search = c.req.query('search');

    const result = await PurchasesService.getUserPurchaseHistory(
      userId,
      page,
      limit,
      status,
      search,
    );

    return c.json(result);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return c.json({ success: false, message: 'Error fetching purchases' }, 500);
  }
});

// GET /api/purchases/:id
purchases.get('/:id', async (c) => {
  try {
    const userId = c.get('userId');
    if (!userId) {
      return c.json({ success: false, message: 'Unauthorized' }, 401);
    }

    const purchaseId = c.req.param('id');
    const purchase = await PurchasesService.getPurchaseDetails(purchaseId);

    if (!purchase) {
      return c.json({ success: false, message: 'Purchase not found' }, 404);
    }

    return c.json({ success: true, purchase });
  } catch (error) {
    console.error('Error fetching purchase:', error);
    return c.json({ success: false, message: 'Error fetching purchase' }, 500);
  }
});

// GET /api/purchases/stats/summary
purchases.get('/stats/summary', async (c) => {
  try {
    const userId = c.get('userId');
    if (!userId) {
      return c.json({ success: false, message: 'Unauthorized' }, 401);
    }

    const stats = await PurchasesService.getUserPurchaseStats(userId);
    return c.json({ success: true, ...stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return c.json({ success: false, message: 'Error fetching stats' }, 500);
  }
});

export { purchases };
