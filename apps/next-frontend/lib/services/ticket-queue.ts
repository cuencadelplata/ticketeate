/**
 * Ticket Queue Manager
 * 
 * Sistema de cola para procesamiento asíncrono de comprobantes
 * Usa Redis para encolar trabajos de generación y envío de emails
 */

import { redisClient } from '../redis-client';
import type { TicketData } from './ticket-generator';

const redis = redisClient['client'];

export interface TicketJob {
  jobId: string;
  reservaId: string;
  userId: string;
  userEmail: string;
  userName?: string;
  eventId: string;
  ticketData: TicketData;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  attempts: number;
  maxAttempts: number;
  createdAt: number;
  processedAt?: number;
  error?: string;
}

const KEYS = {
  pendingJobs: 'tickets:jobs:pending', // Sorted set (score = timestamp)
  processingJobs: 'tickets:jobs:processing', // Hash
  completedJobs: 'tickets:jobs:completed', // Hash
  failedJobs: 'tickets:jobs:failed', // Hash
  jobData: (jobId: string) => `tickets:job:${jobId}`, // Hash
};

/**
 * Encolar un trabajo de generación de comprobante
 */
export async function enqueueTicketJob(
  reservaId: string,
  userId: string,
  userEmail: string,
  eventId: string,
  ticketData: TicketData,
  options?: {
    userName?: string;
    priority?: number; // Menor número = mayor prioridad
    maxAttempts?: number;
  }
): Promise<string> {
  const jobId = `ticket-${reservaId}-${Date.now()}`;
  const timestamp = Date.now();
  const priority = options?.priority || timestamp;

  const job: TicketJob = {
    jobId,
    reservaId,
    userId,
    userEmail,
    userName: options?.userName,
    eventId,
    ticketData,
    status: 'pending',
    attempts: 0,
    maxAttempts: options?.maxAttempts || 3,
    createdAt: timestamp,
  };

  // Guardar datos del job
  await redis.hset(
    KEYS.jobData(jobId),
    'jobId', job.jobId,
    'reservaId', job.reservaId,
    'userId', job.userId,
    'userEmail', job.userEmail,
    'userName', job.userName || '',
    'eventId', job.eventId,
    'ticketData', JSON.stringify(job.ticketData),
    'status', job.status,
    'attempts', job.attempts.toString(),
    'maxAttempts', job.maxAttempts.toString(),
    'createdAt', job.createdAt.toString()
  );

  // Agregar a cola pendiente con prioridad
  await redis.zadd(KEYS.pendingJobs, priority, jobId);

  // Expiración de 7 días
  await redis.expire(KEYS.jobData(jobId), 7 * 24 * 60 * 60);

  console.log(`[TicketQueue] Job enqueued: ${jobId}`);
  return jobId;
}

/**
 * Obtener el siguiente job pendiente
 */
export async function getNextPendingJob(): Promise<TicketJob | null> {
  try {
    // Obtener el job con menor score (más prioritario)
    const jobs = await redis.zrange(KEYS.pendingJobs, 0, 0);

    if (!jobs || jobs.length === 0) {
      return null;
    }

    const jobId = jobs[0];

    // Mover a procesando (transacción atómica con Lua)
    const moved = await redis.eval(
      `
      local jobId = ARGV[1]
      local pendingKey = KEYS[1]
      local processingKey = KEYS[2]
      
      -- Verificar que aún existe en pending
      local score = redis.call('ZSCORE', pendingKey, jobId)
      if not score then
        return 0
      end
      
      -- Remover de pending y agregar a processing
      redis.call('ZREM', pendingKey, jobId)
      redis.call('HSET', processingKey, jobId, ARGV[2])
      
      return 1
      `,
      2,
      KEYS.pendingJobs,
      KEYS.processingJobs,
      jobId,
      Date.now().toString()
    );

    if (moved === 0) {
      return null;
    }

    // Obtener datos completos del job
    const jobData = await redis.hgetall(KEYS.jobData(jobId));

    if (!jobData || Object.keys(jobData).length === 0) {
      console.error(`[TicketQueue] Job data not found: ${jobId}`);
      return null;
    }

    const job: TicketJob = {
      jobId: jobData.jobId as string,
      reservaId: jobData.reservaId as string,
      userId: jobData.userId as string,
      userEmail: jobData.userEmail as string,
      userName: jobData.userName as string || undefined,
      eventId: jobData.eventId as string,
      ticketData: JSON.parse(jobData.ticketData as string),
      status: 'processing',
      attempts: parseInt(jobData.attempts as string, 10),
      maxAttempts: parseInt(jobData.maxAttempts as string, 10),
      createdAt: parseInt(jobData.createdAt as string, 10),
    };

    // Incrementar contador de intentos
    await redis.hincrby(KEYS.jobData(jobId), 'attempts', 1);

    console.log(`[TicketQueue] Job processing: ${jobId}`);
    return job;
  } catch (error) {
    console.error('[TicketQueue] Error getting next job:', error);
    return null;
  }
}

/**
 * Marcar job como completado
 */
export async function markJobCompleted(jobId: string): Promise<void> {
  try {
    const now = Date.now().toString();

    // Actualizar estado
    await redis.hset(
      KEYS.jobData(jobId),
      'status', 'completed',
      'processedAt', now
    );

    // Mover de processing a completed
    await redis.hdel(KEYS.processingJobs, jobId);
    await redis.hset(KEYS.completedJobs, jobId, now);

    console.log(`[TicketQueue] Job completed: ${jobId}`);
  } catch (error) {
    console.error('[TicketQueue] Error marking job completed:', error);
  }
}

/**
 * Marcar job como fallido
 */
export async function markJobFailed(
  jobId: string,
  error: string,
  retry: boolean = true
): Promise<void> {
  try {
    const jobData = await redis.hgetall(KEYS.jobData(jobId));

    if (!jobData) {
      console.error(`[TicketQueue] Job not found: ${jobId}`);
      return;
    }

    const attempts = parseInt(jobData.attempts as string, 10);
    const maxAttempts = parseInt(jobData.maxAttempts as string, 10);

    // Si aún tiene intentos y se permite retry
    if (retry && attempts < maxAttempts) {
      console.log(`[TicketQueue] Job retry ${attempts}/${maxAttempts}: ${jobId}`);

      // Volver a encolar con delay exponencial
      const delay = Math.pow(2, attempts) * 1000; // 2^n segundos
      const newPriority = Date.now() + delay;

      await redis.hset(KEYS.jobData(jobId), 'status', 'pending');
      await redis.hdel(KEYS.processingJobs, jobId);
      await redis.zadd(KEYS.pendingJobs, newPriority, jobId);
    } else {
      // Marcar como fallido definitivamente
      console.error(`[TicketQueue] Job failed permanently: ${jobId}`);

      await redis.hset(
        KEYS.jobData(jobId),
        'status', 'failed',
        'error', error,
        'processedAt', Date.now().toString()
      );

      await redis.hdel(KEYS.processingJobs, jobId);
      await redis.hset(KEYS.failedJobs, jobId, Date.now().toString());
    }
  } catch (err) {
    console.error('[TicketQueue] Error marking job failed:', err);
  }
}

/**
 * Obtener estadísticas de la cola
 */
export async function getQueueStats(): Promise<{
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}> {
  try {
    const [pending, processing, completed, failed] = await Promise.all([
      redis.zcard(KEYS.pendingJobs),
      redis.hlen(KEYS.processingJobs),
      redis.hlen(KEYS.completedJobs),
      redis.hlen(KEYS.failedJobs),
    ]);

    return {
      pending: pending || 0,
      processing: processing || 0,
      completed: completed || 0,
      failed: failed || 0,
    };
  } catch (error) {
    console.error('[TicketQueue] Error getting stats:', error);
    return { pending: 0, processing: 0, completed: 0, failed: 0 };
  }
}

/**
 * Limpiar jobs completados antiguos (más de 7 días)
 */
export async function cleanupOldJobs(daysOld: number = 7): Promise<number> {
  try {
    const cutoffTime = Date.now() - daysOld * 24 * 60 * 60 * 1000;
    let cleaned = 0;

    // Limpiar completed
    const completedJobs = await redis.hgetall(KEYS.completedJobs);
    if (completedJobs) {
      for (const [jobId, timestamp] of Object.entries(completedJobs)) {
        if (parseInt(timestamp as string, 10) < cutoffTime) {
          await redis.hdel(KEYS.completedJobs, jobId);
          await redis.del(KEYS.jobData(jobId));
          cleaned++;
        }
      }
    }

    // Limpiar failed
    const failedJobs = await redis.hgetall(KEYS.failedJobs);
    if (failedJobs) {
      for (const [jobId, timestamp] of Object.entries(failedJobs)) {
        if (parseInt(timestamp as string, 10) < cutoffTime) {
          await redis.hdel(KEYS.failedJobs, jobId);
          await redis.del(KEYS.jobData(jobId));
          cleaned++;
        }
      }
    }

    console.log(`[TicketQueue] Cleaned ${cleaned} old jobs`);
    return cleaned;
  } catch (error) {
    console.error('[TicketQueue] Error cleaning up jobs:', error);
    return 0;
  }
}

/**
 * Recuperar jobs que quedaron en processing (crashed workers)
 */
export async function recoverStalledJobs(timeoutMinutes: number = 10): Promise<number> {
  try {
    const cutoffTime = Date.now() - timeoutMinutes * 60 * 1000;
    let recovered = 0;

    const processingJobs = await redis.hgetall(KEYS.processingJobs);
    if (!processingJobs) return 0;

    for (const [jobId, startTime] of Object.entries(processingJobs)) {
      const timestamp = parseInt(startTime as string, 10);

      if (timestamp < cutoffTime) {
        console.log(`[TicketQueue] Recovering stalled job: ${jobId}`);

        // Volver a encolar
        await redis.hdel(KEYS.processingJobs, jobId);
        await redis.zadd(KEYS.pendingJobs, Date.now(), jobId);
        await redis.hset(KEYS.jobData(jobId), 'status', 'pending');

        recovered++;
      }
    }

    if (recovered > 0) {
      console.log(`[TicketQueue] Recovered ${recovered} stalled jobs`);
    }

    return recovered;
  } catch (error) {
    console.error('[TicketQueue] Error recovering stalled jobs:', error);
    return 0;
  }
}
