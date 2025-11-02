// Exportar ambas versiones del modal de cola
export { QueueModal } from '../queue-modal'; // Versión con mock/supabase
export { QueueModalRedis } from '../queue-modal-redis'; // Versión con Redis
export { QueueGuard } from './QueueGuard';

// Exportar hooks de cola
export { useMockQueue } from '@/hooks/use-mock-queue';
export { useQueueRedis } from '@/hooks/use-queue-redis';
