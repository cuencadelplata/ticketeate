-- Crear políticas RLS para colas_evento
-- Permitir lectura pública
CREATE POLICY "Allow public read access to colas_evento" ON colas_evento
    FOR SELECT USING (true);

-- Permitir inserción para service role
CREATE POLICY "Allow service role insert to colas_evento" ON colas_evento
    FOR INSERT WITH CHECK (true);

-- Permitir actualización para service role
CREATE POLICY "Allow service role update to colas_evento" ON colas_evento
    FOR UPDATE USING (true);

-- Habilitar RLS
ALTER TABLE colas_evento ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para cola_turnos
-- Permitir lectura pública
CREATE POLICY "Allow public read access to cola_turnos" ON cola_turnos
    FOR SELECT USING (true);

-- Permitir inserción para service role
CREATE POLICY "Allow service role insert to cola_turnos" ON cola_turnos
    FOR INSERT WITH CHECK (true);

-- Permitir actualización para service role
CREATE POLICY "Allow service role update to cola_turnos" ON cola_turnos
    FOR UPDATE USING (true);

-- Habilitar RLS
ALTER TABLE cola_turnos ENABLE ROW LEVEL SECURITY;




