-- Configurar pg_cron en Supabase para ejecutar un webhook cada 5 minutos

-- Crear función que dispara el webhook HTTP
CREATE OR REPLACE FUNCTION trigger_update_event_states_webhook()
RETURNS void AS $$
DECLARE
  response RECORD;
BEGIN
  -- Hacer llamada HTTP al endpoint
  SELECT * INTO response FROM
    net.http_post(
      url := 'https://tu-dominio.com/api/cron/update-event-states',
      headers := '{"x-cron-secret":"CRON_SECRET"}'::jsonb,
      body := '{}'::jsonb
    ) AS x(status int, content text);
  
  RAISE NOTICE 'Webhook triggered: %', response.status;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Webhook error: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Programar la ejecución cada 5 minutos usando pg_cron
-- Nota: pg_cron debe estar habilitado en tu proyecto Supabase
SELECT cron.schedule(
  'update-event-states-webhook',
  '*/5 * * * *',
  'SELECT trigger_update_event_states_webhook()'
);

-- Verificar que el cron está programado
SELECT * FROM cron.job;

-- Si necesitas deshabilitar el cron:
-- SELECT cron.unschedule('update-event-states-webhook');
