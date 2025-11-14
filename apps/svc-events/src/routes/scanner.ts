import { Hono } from 'hono';
import { ScannerService } from '../services/scanner-service';

const scanner = new Hono();

// POST /api/scanner/validate
scanner.post('/validate', async (c) => {
  try {
    const body = await c.req.json();
    const { code, eventId } = body;

    const result = await ScannerService.validateQRCode(code, eventId, c.get('userId'));

    return c.json(result, result.success ? 200 : 400);
  } catch (error) {
    console.error('Error validating QR:', error);
    return c.json({ success: false, message: 'Error validating QR' }, 500);
  }
});

// GET /api/scanner/stats
scanner.get('/stats', async (c) => {
  try {
    const eventId = c.req.query('eventId');
    const date = c.req.query('date');

    if (!eventId) {
      return c.json({ success: false, message: 'eventId is required' }, 400);
    }

    const stats = await ScannerService.getEventScanStats(eventId, date);

    if (!stats) {
      return c.json({ success: false, message: 'Event not found' }, 404);
    }

    return c.json({ success: true, ...stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return c.json({ success: false, message: 'Error fetching stats' }, 500);
  }
});

export { scanner };
