import type { NextRequest } from 'next/server';

//Mocks
const logLevels = ['info', 'warning', 'error', 'debug'];
const logMessages = [
  'Application started successfully',
  'Database connection established',
  'User authentication successful',
  'API request processed',
  'Cache miss for key: user_session',
  'High memory usage detected',
  'Database connection timeout',
  'Failed to process payment',
  'Rate limit exceeded for IP',
  'SSL certificate expires in 30 days',
  'Backup completed successfully',
  'New user registered',
  'Email sent successfully',
  'File upload completed',
  'Background job queued',
];

function generateRandomLog() {
  const level = logLevels[Math.floor(Math.random() * logLevels.length)];
  const message = logMessages[Math.floor(Math.random() * logMessages.length)];
  const timestamp = new Date().toISOString();

  return {
    id: Date.now() + Math.random(),
    level,
    message,
    timestamp,
    source: Math.random() > 0.5 ? 'app' : 'api',
    userId:
      Math.random() > 0.7 ? `user_${Math.floor(Math.random() * 1000)}` : null,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get('level');

  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const initialLogs = Array.from({ length: 10 }, () => generateRandomLog());

      initialLogs.forEach(log => {
        if (!level || log.level === level) {
          const data = `data: ${JSON.stringify(log)}\n\n`;
          controller.enqueue(encoder.encode(data));
        }
      });

      const interval = setInterval(
        () => {
          const log = generateRandomLog();

          if (!level || log.level === level) {
            const data = `data: ${JSON.stringify(log)}\n\n`;
            controller.enqueue(encoder.encode(data));
          }
        },
        Math.random() * 3000 + 2000
      );

      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, { headers });
}
