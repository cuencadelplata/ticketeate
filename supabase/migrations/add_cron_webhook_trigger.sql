-- Crear tabla para disparar el webhook
CREATE TABLE IF NOT EXISTS cron_triggers (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  last_executed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar el trigger para update-event-states
INSERT INTO cron_triggers (name)
VALUES ('update-event-states')
ON CONFLICT (name) DO NOTHING;

-- Crear función que actualiza el timestamp (para disparar el webhook)
CREATE OR REPLACE FUNCTION trigger_webhook()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_executed = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger en la tabla cron_triggers
DROP TRIGGER IF EXISTS cron_trigger_update ON cron_triggers;
CREATE TRIGGER cron_trigger_update
  BEFORE UPDATE ON cron_triggers
  FOR EACH ROW
  EXECUTE FUNCTION trigger_webhook();

-- Crear función que dispara el webhook automáticamente cada cierto tiempo
CREATE OR REPLACE FUNCTION check_and_trigger_cron()
RETURNS void AS $$
BEGIN
  UPDATE cron_triggers
  SET last_executed = NOW()
  WHERE name = 'update-event-states'
    AND (last_executed IS NULL OR last_executed < NOW() - INTERVAL '5 minutes');
END;
$$ LANGUAGE plpgsql;

-- Crear realtime subscription (esto es lo que dispara el webhook)
-- En Supabase, los webhooks se configuran desde el dashboard
