/**
 * Ticket Worker
 *
 * Worker que procesa la cola de comprobantes de forma continua
 * Puede ejecutarse como:
 * - Script standalone: node ticket-worker.js
 * - Cron job: cada X minutos
 * - Background service en contenedor
 */

import {
  getNextPendingJob,
  markJobCompleted,
  markJobFailed,
  getQueueStats,
  recoverStalledJobs,
  cleanupOldJobs,
} from '../services/ticket-queue';
import { createCriticalCircuitBreaker } from '../circuit-breaker';

const WORKER_CONFIG = {
  pollIntervalMs: parseInt(process.env.TICKET_WORKER_POLL_INTERVAL || '5000', 10),
  maxConcurrent: parseInt(process.env.TICKET_WORKER_MAX_CONCURRENT || '5', 10),
  stalledJobTimeout: parseInt(process.env.TICKET_WORKER_STALLED_TIMEOUT || '10', 10),
  cleanupIntervalMs: parseInt(process.env.TICKET_WORKER_CLEANUP_INTERVAL || '3600000', 10), // 1 hora
};

let isRunning = false;
let activeJobs = 0;

// Circuit breaker para envío de emails (operación crítica)
const emailSendBreaker = createCriticalCircuitBreaker(
  async (url: string, options: RequestInit): Promise<Response> => {
    const response = await fetch(url, options);

    // Considerar errores HTTP 5xx como fallos del servicio
    if (response.status >= 500 && response.status < 600) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    if (!response.ok) {
      // Intentar obtener el error del body
      try {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
      } catch {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }

    return response;
  },
  'email-send',
);

/**
 * Procesar un job de comprobante
 */
async function processJob(jobId: string, job: any): Promise<void> {
  console.log(`[TicketWorker] Processing job ${jobId}...`);

  try {
    // Llamar al API de envío de email a través del circuit breaker
    const emailUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/tickets/send-email`;
    const response = await emailSendBreaker.fire(emailUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Incluir API key interno para autenticación
        'X-Internal-API-Key': process.env.INTERNAL_API_KEY || '',
      },
      body: JSON.stringify({
        to: job.userEmail,
        userName: job.userName,
        ticketData: job.ticketData,
      }),
    });

    const result = await response.json();
    console.log(`[TicketWorker] Job ${jobId} completed. Email ID: ${result.emailId}`);

    // Marcar como completado
    await markJobCompleted(jobId);
  } catch (error: any) {
    // El circuit breaker puede rechazar la llamada si está abierto
    const errorMessage =
      error.code === 'ECIRCUITOPEN'
        ? 'Email service temporarily unavailable (circuit breaker open)'
        : error.message || 'Failed to send email';

    console.error(`[TicketWorker] Job ${jobId} failed:`, errorMessage);

    // Marcar como fallido (con retry si es posible)
    await markJobFailed(jobId, errorMessage, true);
  }
}

/**
 * Loop principal del worker
 */
async function workerLoop(): Promise<void> {
  while (isRunning) {
    try {
      // No procesar más si ya hay muchos jobs activos
      if (activeJobs >= WORKER_CONFIG.maxConcurrent) {
        await sleep(WORKER_CONFIG.pollIntervalMs);
        continue;
      }

      // Obtener siguiente job
      const job = await getNextPendingJob();

      if (!job) {
        // No hay jobs, esperar
        await sleep(WORKER_CONFIG.pollIntervalMs);
        continue;
      }

      // Procesar job de forma asíncrona
      activeJobs++;
      processJob(job.jobId, job).finally(() => {
        activeJobs--;
      });

      // Pequeño delay antes de obtener el siguiente
      await sleep(100);
    } catch (error) {
      console.error('[TicketWorker] Error in worker loop:', error);
      await sleep(WORKER_CONFIG.pollIntervalMs);
    }
  }
}

/**
 * Tarea de mantenimiento
 */
async function maintenanceTask(): Promise<void> {
  console.log('[TicketWorker] Running maintenance...');

  try {
    // Recuperar jobs estancados
    const recovered = await recoverStalledJobs(WORKER_CONFIG.stalledJobTimeout);
    if (recovered > 0) {
      console.log(`[TicketWorker] Recovered ${recovered} stalled jobs`);
    }

    // Limpiar jobs viejos (más de 7 días)
    const cleaned = await cleanupOldJobs(7);
    if (cleaned > 0) {
      console.log(`[TicketWorker] Cleaned ${cleaned} old jobs`);
    }

    // Mostrar estadísticas
    const stats = await getQueueStats();
    console.log('[TicketWorker] Queue stats:', stats);
  } catch (error) {
    console.error('[TicketWorker] Error in maintenance task:', error);
  }
}

/**
 * Iniciar worker
 */
export async function startWorker(): Promise<void> {
  if (isRunning) {
    console.log('[TicketWorker] Already running');
    return;
  }

  console.log('[TicketWorker] Starting...');
  console.log('[TicketWorker] Config:', WORKER_CONFIG);

  isRunning = true;

  // Iniciar loop principal
  workerLoop();

  // Iniciar tarea de mantenimiento periódica
  setInterval(maintenanceTask, WORKER_CONFIG.cleanupIntervalMs);

  // Ejecutar mantenimiento inmediatamente
  maintenanceTask();

  console.log('[TicketWorker] Started successfully');
}

/**
 * Detener worker (graceful shutdown)
 */
export async function stopWorker(): Promise<void> {
  console.log('[TicketWorker] Stopping...');
  isRunning = false;

  // Esperar a que terminen los jobs activos
  while (activeJobs > 0) {
    console.log(`[TicketWorker] Waiting for ${activeJobs} active jobs to finish...`);
    await sleep(1000);
  }

  console.log('[TicketWorker] Stopped');
}

/**
 * Helper: Sleep
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Manejo de señales para shutdown
 */
if (typeof process !== 'undefined') {
  process.on('SIGTERM', async () => {
    console.log('[TicketWorker] Received SIGTERM');
    await stopWorker();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('[TicketWorker] Received SIGINT');
    await stopWorker();
    process.exit(0);
  });
}

// Si se ejecuta directamente (no como import)
// eslint-disable-next-line no-undef
if (typeof require !== 'undefined' && require.main === module) {
  startWorker().catch((error) => {
    console.error('[TicketWorker] Fatal error:', error);
    process.exit(1);
  });
}
