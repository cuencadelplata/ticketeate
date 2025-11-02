#!/usr/bin/env ts-node

/**
 * Script para ejecutar el Ticket Worker
 * 
 * Uso:
 *   tsx scripts/start-ticket-worker.ts
 *   npm run worker:tickets
 */

import 'dotenv/config';
import { startWorker } from '../lib/workers/ticket-worker';

console.log('='.repeat(60));
console.log('🎫 TicketEate - Ticket Worker');
console.log('='.repeat(60));
console.log('');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('App URL:', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
console.log('Redis URL:', process.env.REDIS_URL ? '✓ Configured' : '✗ Missing');
console.log('Resend API Key:', process.env.RESEND_API_KEY ? '✓ Configured' : '✗ Missing');
console.log('');
console.log('='.repeat(60));
console.log('');

// Validar configuración requerida
const requiredEnvVars = ['REDIS_URL', 'RESEND_API_KEY', 'NEXT_PUBLIC_APP_URL'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Error: Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('');
  console.error('Please configure these variables in your .env file');
  process.exit(1);
}

// Iniciar el worker
startWorker()
  .then(() => {
    console.log('✅ Ticket Worker running...');
    console.log('Press Ctrl+C to stop');
    console.log('');
  })
  .catch((error) => {
    console.error('❌ Fatal error starting worker:', error);
    process.exit(1);
  });

// Manejo de errores no capturados
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});
