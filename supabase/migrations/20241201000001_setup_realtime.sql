-- Configurar Realtime para el sistema de colas
-- Ejecutar en el SQL Editor de Supabase

-- Habilitar Realtime para las tablas de cola
ALTER TABLE colas_evento REPLICA IDENTITY FULL;
ALTER TABLE cola_turnos REPLICA IDENTITY FULL;

-- Crear función para publicar updates de cola
CREATE OR REPLACE FUNCTION publish_queue_update()
RETURNS TRIGGER AS $$
DECLARE
  event_id TEXT;
  queue_data JSONB;
BEGIN
  -- Obtener eventId desde la tabla colas_evento
  IF TG_TABLE_NAME = 'cola_turnos' THEN
    SELECT eventoid INTO event_id 
    FROM colas_evento 
    WHERE colaid = COALESCE(NEW.colaid, OLD.colaid);
  ELSE
    event_id := COALESCE(NEW.eventoid, OLD.eventoid);
  END IF;

  -- Construir datos del update
  queue_data := jsonb_build_object(
    'eventId', event_id,
    'action', TG_OP,
    'timestamp', EXTRACT(EPOCH FROM NOW()) * 1000,
    'data', CASE 
      WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
      ELSE to_jsonb(NEW)
    END
  );

  -- Publicar notificación
  PERFORM pg_notify('queue_update', queue_data::text);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Crear triggers para cola_turnos
CREATE TRIGGER queue_turnos_update_trigger
  AFTER INSERT OR UPDATE OR DELETE ON cola_turnos
  FOR EACH ROW EXECUTE FUNCTION publish_queue_update();

-- Crear triggers para colas_evento
CREATE TRIGGER colas_evento_update_trigger
  AFTER INSERT OR UPDATE OR DELETE ON colas_evento
  FOR EACH ROW EXECUTE FUNCTION publish_queue_update();

-- Función para obtener estadísticas de cola en tiempo real
CREATE OR REPLACE FUNCTION get_queue_stats(event_id TEXT)
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'eventId', event_id,
    'totalInQueue', (
      SELECT COUNT(*) 
      FROM cola_turnos ct
      JOIN colas_evento ce ON ct.colaid = ce.colaid
      WHERE ce.eventoid = event_id AND ct.estado = 'esperando'
    ),
    'totalActive', (
      SELECT COUNT(*) 
      FROM cola_turnos ct
      JOIN colas_evento ce ON ct.colaid = ce.colaid
      WHERE ce.eventoid = event_id AND ct.estado = 'en_compra'
    ),
    'totalCompleted', (
      SELECT COUNT(*) 
      FROM cola_turnos ct
      JOIN colas_evento ce ON ct.colaid = ce.colaid
      WHERE ce.eventoid = event_id AND ct.estado = 'completado'
    ),
    'maxConcurrent', (
      SELECT max_concurrentes 
      FROM colas_evento 
      WHERE eventoid = event_id
    ),
    'timestamp', EXTRACT(EPOCH FROM NOW()) * 1000
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener posición de usuario en cola
CREATE OR REPLACE FUNCTION get_user_queue_position(event_id TEXT, user_id TEXT)
RETURNS JSONB AS $$
DECLARE
  position_data JSONB;
  user_turno RECORD;
BEGIN
  -- Obtener información del turno del usuario
  SELECT ct.*, ce.max_concurrentes
  INTO user_turno
  FROM cola_turnos ct
  JOIN colas_evento ce ON ct.colaid = ce.colaid
  WHERE ce.eventoid = event_id AND ct.usuarioid = user_id
  ORDER BY ct.fecha_ingreso DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Calcular posición si está esperando
  IF user_turno.estado = 'esperando' THEN
    SELECT jsonb_build_object(
      'position', (
        SELECT COUNT(*) + 1
        FROM cola_turnos ct2
        JOIN colas_evento ce2 ON ct2.colaid = ce2.colaid
        WHERE ce2.eventoid = event_id 
          AND ct2.estado = 'esperando'
          AND ct2.fecha_ingreso < user_turno.fecha_ingreso
      ),
      'totalInQueue', (
        SELECT COUNT(*)
        FROM cola_turnos ct3
        JOIN colas_evento ce3 ON ct3.colaid = ce3.colaid
        WHERE ce3.eventoid = event_id AND ct3.estado = 'esperando'
      ),
      'totalActive', (
        SELECT COUNT(*)
        FROM cola_turnos ct4
        JOIN colas_evento ce4 ON ct4.colaid = ce4.colaid
        WHERE ce4.eventoid = event_id AND ct4.estado = 'en_compra'
      ),
      'maxConcurrent', user_turno.max_concurrentes,
      'estimatedWaitTime', (
        SELECT COUNT(*) * 120 -- 2 minutos por posición
        FROM cola_turnos ct5
        JOIN colas_evento ce5 ON ct5.colaid = ce5.colaid
        WHERE ce5.eventoid = event_id 
          AND ct5.estado = 'esperando'
          AND ct5.fecha_ingreso < user_turno.fecha_ingreso
      ),
      'status', user_turno.estado,
      'timestamp', EXTRACT(EPOCH FROM NOW()) * 1000
    ) INTO position_data;
  ELSE
    -- Usuario activo o completado
    SELECT jsonb_build_object(
      'position', 0,
      'totalInQueue', (
        SELECT COUNT(*)
        FROM cola_turnos ct6
        JOIN colas_evento ce6 ON ct6.colaid = ce6.colaid
        WHERE ce6.eventoid = event_id AND ct6.estado = 'esperando'
      ),
      'totalActive', (
        SELECT COUNT(*)
        FROM cola_turnos ct7
        JOIN colas_evento ce7 ON ct7.colaid = ce7.colaid
        WHERE ce7.eventoid = event_id AND ct7.estado = 'en_compra'
      ),
      'maxConcurrent', user_turno.max_concurrentes,
      'estimatedWaitTime', 0,
      'status', user_turno.estado,
      'timestamp', EXTRACT(EPOCH FROM NOW()) * 1000
    ) INTO position_data;
  END IF;

  RETURN position_data;
END;
$$ LANGUAGE plpgsql;

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_cola_turnos_eventoid ON cola_turnos(colaid);
CREATE INDEX IF NOT EXISTS idx_cola_turnos_usuarioid ON cola_turnos(usuarioid);
CREATE INDEX IF NOT EXISTS idx_cola_turnos_estado ON cola_turnos(estado);
CREATE INDEX IF NOT EXISTS idx_cola_turnos_fecha_ingreso ON cola_turnos(fecha_ingreso);

-- Verificar configuración
SELECT 
  schemaname,
  tablename,
  replicaidentity
FROM pg_tables 
JOIN pg_class ON pg_class.relname = pg_tables.tablename
WHERE tablename IN ('colas_evento', 'cola_turnos')
  AND schemaname = 'public';
