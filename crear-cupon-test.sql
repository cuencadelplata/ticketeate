-- Script para crear un cupón de prueba
-- Ejecutar esto en Prisma Studio o tu cliente de PostgreSQL

-- Primero obtener un eventoid válido
-- SELECT eventoid FROM eventos LIMIT 1;

-- Crear cupón de prueba (reemplaza 'TU_EVENT_ID' con un eventoid real)
INSERT INTO cupones_evento (
  eventoid,
  codigo,
  porcentaje_descuento,
  fecha_expiracion,
  limite_usos,
  usos_actuales,
  estado,
  version,
  is_active
) VALUES (
  'b0f15448-398f-4202-898e-830f05f3dc14', -- FUTTTURA FESTIVAL
  'DESCUENTO20',
  20.00,
  '2026-12-31 23:59:59',
  100,
  0,
  'ACTIVO',
  1,
  true
);

-- Cupones adicionales para pruebas
INSERT INTO cupones_evento (
  eventoid,
  codigo,
  porcentaje_descuento,
  fecha_expiracion,
  limite_usos,
  usos_actuales,
  estado,
  version,
  is_active
) VALUES (
  'b0f15448-398f-4202-898e-830f05f3dc14',
  'PROMO10',
  10.00,
  '2026-12-31 23:59:59',
  50,
  0,
  'ACTIVO',
  1,
  true
),
(
  'b0f15448-398f-4202-898e-830f05f3dc14',
  'VIP50',
  50.00,
  '2026-06-30 23:59:59',
  10,
  0,
  'ACTIVO',
  1,
  true
);
