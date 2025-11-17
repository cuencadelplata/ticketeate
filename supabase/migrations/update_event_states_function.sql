-- SQL para crear una función que actualiza los estados de eventos
-- Ejecuta esto en el SQL editor de Supabase

CREATE OR REPLACE FUNCTION update_event_states()
RETURNS TABLE (
  processed INT,
  transitions JSONB
) AS $$
DECLARE
  v_now TIMESTAMPTZ := NOW();
  v_transitions JSONB := '[]'::JSONB;
  v_count INT := 0;
  v_evento RECORD;
  v_current_state VARCHAR;
  v_final_date TIMESTAMPTZ;
  v_new_state VARCHAR;
BEGIN
  -- Loop through all eventos
  FOR v_evento IN 
    SELECT 
      e.eventoid,
      e.creadorid,
      e.fecha_publicacion,
      e.deleted_at,
      (SELECT Estado FROM evento_estado 
       WHERE eventoid = e.eventoid 
       ORDER BY fecha_de_cambio DESC LIMIT 1) as current_state,
      (SELECT MAX(COALESCE(fecha_fin, fecha_hora)) 
       FROM fechas_evento WHERE eventoid = e.eventoid) as final_date
    FROM eventos e
  LOOP
    v_current_state := v_evento.current_state;
    v_final_date := v_evento.final_date;
    v_new_state := NULL;

    -- Rule 1: Soft delete
    IF v_evento.deleted_at IS NOT NULL AND v_current_state != 'CANCELADO' THEN
      v_new_state := 'CANCELADO';
    -- Rule 2: Event ended
    ELSIF v_final_date IS NOT NULL AND v_final_date <= v_now AND v_current_state = 'ACTIVO' THEN
      v_new_state := 'COMPLETADO';
    -- Rule 3: Publish date reached
    ELSIF v_evento.fecha_publicacion IS NOT NULL 
      AND v_evento.fecha_publicacion <= v_now 
      AND v_current_state = 'OCULTO' THEN
      v_new_state := 'ACTIVO';
    END IF;

    -- If there's a state change, insert it
    IF v_new_state IS NOT NULL THEN
      INSERT INTO evento_estado (stateventid, eventoid, Estado, usuarioid, fecha_de_cambio)
      VALUES (gen_random_uuid(), v_evento.eventoid, v_new_state, v_evento.creadorid, v_now);
      
      v_count := v_count + 1;
      v_transitions := v_transitions || jsonb_build_array(
        jsonb_build_object(
          'eventId', v_evento.eventoid,
          'from', v_current_state,
          'to', v_new_state
        )
      );
    END IF;
  END LOOP;

  RETURN QUERY SELECT v_count, v_transitions;
END;
$$ LANGUAGE plpgsql;

-- Crear un cron job con pg_cron (si está disponible)
-- SELECT cron.schedule('update-event-states', '*/15 * * * *', 'SELECT update_event_states()');
