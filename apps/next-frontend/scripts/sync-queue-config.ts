/**
 * Script para sincronizar configuración de colas desde la base de datos a Redis
 * Uso: npx tsx scripts/sync-queue-config.ts [eventId]
 */

import 'dotenv/config';
import { prisma } from '@repo/db';
import { Redis } from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://default:ticketeate123@localhost:6379';

async function syncQueueConfig(eventId?: string) {
  const redis = new Redis(REDIS_URL);

  try {
    console.log('🔄 Syncing queue configurations from database to Redis...\n');

    // Obtener configuraciones de la base de datos
    const where = eventId ? { eventoid: eventId } : {};
    const configs = await prisma.colas_evento.findMany({
      where,
      include: {
        eventos: {
          select: {
            titulo: true,
          },
        },
      },
    });

    if (configs.length === 0) {
      console.log('⚠️  No queue configurations found in database');
      if (eventId) {
        console.log(`   for event: ${eventId}`);
      }
      return;
    }

    console.log(`📊 Found ${configs.length} queue configuration(s)\n`);

    // Sincronizar cada configuración a Redis
    for (const config of configs) {
      const redisKey = `queue:${config.eventoid}:config`;

      console.log(`Event: ${config.eventos.titulo}`);
      console.log(`  Event ID: ${config.eventoid}`);
      console.log(`  Max Concurrent: ${config.max_concurrentes}`);
      console.log(`  Max Users: ${config.max_usuarios}`);

      // Guardar en Redis
      await redis.hset(
        redisKey,
        'eventId',
        config.eventoid,
        'maxConcurrentBuyers',
        config.max_concurrentes.toString(),
        'queueEnabled',
        '1',
        'reservationTimeSeconds',
        '300',
        'queueTimeoutSeconds',
        '3600',
      );

      // Verificar que se guardó correctamente
      const saved = await redis.hgetall(redisKey);
      console.log(`  ✅ Synced to Redis:`, redisKey);
      console.log(`     Redis values:`, saved);
      console.log('');
    }

    console.log('✨ Sync completed successfully!');
  } catch (error) {
    console.error('❌ Error syncing queue config:', error);
    throw error;
  } finally {
    await redis.quit();
    await prisma.$disconnect();
  }
}

// Ejecutar
const eventId = process.argv[2];
syncQueueConfig(eventId)
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
