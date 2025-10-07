-- Deshabilitar RLS en las tablas de cola
ALTER TABLE colas_evento DISABLE ROW LEVEL SECURITY;
ALTER TABLE cola_turnos DISABLE ROW LEVEL SECURITY;

-- Eliminar políticas RLS existentes si las hay
DROP POLICY IF EXISTS "Allow public read access to colas_evento" ON colas_evento;
DROP POLICY IF EXISTS "Allow service role insert to colas_evento" ON colas_evento;
DROP POLICY IF EXISTS "Allow service role update to colas_evento" ON colas_evento;

DROP POLICY IF EXISTS "Allow public read access to cola_turnos" ON cola_turnos;
DROP POLICY IF EXISTS "Allow service role insert to cola_turnos" ON cola_turnos;
DROP POLICY IF EXISTS "Allow service role update to cola_turnos" ON cola_turnos;

