-- Configurar cron jobs para el worker de colas
-- Ejecutar en el SQL Editor de Supabase

-- Crear extensión pg_cron si no existe
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Función para ejecutar el worker de colas
CREATE OR REPLACE FUNCTION execute_queue_worker()
RETURNS void AS $$
BEGIN
  -- Ejecutar la Edge Function del worker
  PERFORM net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/queue-worker',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  
  -- Log de ejecución
  INSERT INTO cron_logs (function_name, executed_at, status)
  VALUES ('queue_worker', NOW(), 'success');
  
EXCEPTION WHEN OTHERS THEN
  -- Log de error
  INSERT INTO cron_logs (function_name, executed_at, status, error_message)
  VALUES ('queue_worker', NOW(), 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql;

-- Crear tabla para logs de cron jobs
CREATE TABLE IF NOT EXISTS cron_logs (
  id SERIAL PRIMARY KEY,
  function_name VARCHAR(100) NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'error')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configurar cron job para ejecutar cada 30 segundos
-- Nota: pg_cron tiene limitaciones de frecuencia mínima (1 minuto)
-- Para mayor frecuencia, usar un worker externo
SELECT cron.schedule(
  'queue-worker-30s',
  '*/1 * * * *', -- Cada minuto (frecuencia mínima de pg_cron)
  'SELECT execute_queue_worker();'
);

-- Configurar cron job para limpiar logs antiguos (diario)
SELECT cron.schedule(
  'cleanup-cron-logs',
  '0 2 * * *', -- Cada día a las 2 AM
  'DELETE FROM cron_logs WHERE created_at < NOW() - INTERVAL ''7 days'';'
);

-- Verificar cron jobs configurados
SELECT * FROM cron.job;

-- Ver logs recientes
SELECT * FROM cron_logs ORDER BY executed_at DESC LIMIT 10;
