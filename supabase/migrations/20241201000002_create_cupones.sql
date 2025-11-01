-- Create table for discount coupons
CREATE TABLE IF NOT EXISTS cupones_evento (
    cuponid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    eventoid UUID NOT NULL REFERENCES eventos(eventoid),
    codigo VARCHAR(50) NOT NULL,
    porcentaje_descuento DECIMAL(5,2) NOT NULL CHECK (porcentaje_descuento > 0 AND porcentaje_descuento <= 100),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP WITH TIME ZONE NOT NULL,
    limite_usos INTEGER NOT NULL CHECK (limite_usos > 0),
    usos_actuales INTEGER DEFAULT 0 CHECK (usos_actuales >= 0),
    estado VARCHAR(20) DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'INACTIVO', 'EXPIRADO', 'AGOTADO')),
    CONSTRAINT uq_codigo_evento UNIQUE (eventoid, codigo)
);

-- Create table for coupon redemptions
CREATE TABLE IF NOT EXISTS cupones_redimidos (
    redencionid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cuponid UUID NOT NULL REFERENCES cupones_evento(cuponid),
    eventoid UUID NOT NULL REFERENCES eventos(eventoid),
    usuarioid UUID NOT NULL,
    fecha_redencion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    descuento_aplicado DECIMAL(10,2) NOT NULL,
    CONSTRAINT uq_cupon_usuario_evento UNIQUE (cuponid, usuarioid, eventoid)
);

-- Create function to update coupon status
CREATE OR REPLACE FUNCTION update_cupon_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if coupon has reached its usage limit
    IF NEW.usos_actuales >= NEW.limite_usos THEN
        NEW.estado = 'AGOTADO';
    -- Check if coupon has expired
    ELSIF CURRENT_TIMESTAMP >= NEW.fecha_expiracion THEN
        NEW.estado = 'EXPIRADO';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for coupon status updates
CREATE TRIGGER tr_update_cupon_status
BEFORE UPDATE ON cupones_evento
FOR EACH ROW
EXECUTE FUNCTION update_cupon_status();

-- Add indices for better query performance
CREATE INDEX idx_cupones_evento_eventoid ON cupones_evento(eventoid);
CREATE INDEX idx_cupones_evento_codigo ON cupones_evento(codigo);
CREATE INDEX idx_cupones_redimidos_cuponid ON cupones_redimidos(cuponid);
CREATE INDEX idx_cupones_redimidos_eventoid ON cupones_redimidos(eventoid);
CREATE INDEX idx_cupones_redimidos_usuarioid ON cupones_redimidos(usuarioid);