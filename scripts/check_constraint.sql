-- Query para ver la definición exacta del check constraint
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'cupones_evento_history_change_type_check';

-- Ver la definición del enum change_type
SELECT 
    t.typname AS enum_name,
    e.enumlabel AS enum_value,
    e.enumsortorder AS sort_order
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'change_type'
ORDER BY e.enumsortorder;

-- Ver la estructura de la tabla cupones_evento_history
SELECT 
    column_name,
    data_type,
    udt_name,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'cupones_evento_history'
AND column_name = 'change_type';
