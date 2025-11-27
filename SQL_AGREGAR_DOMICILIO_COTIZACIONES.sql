-- =============================================
-- AGREGAR CAMPOS DE DOMICILIO A COTIZACIONES
-- =============================================
-- Ejecutar en Supabase SQL Editor
-- Fecha: Octubre 2025
-- Proyecto: Panel Admin Tintas v2.2.0

-- Agregar columnas de domicilio a la tabla cotizaciones
ALTER TABLE cotizaciones
ADD COLUMN IF NOT EXISTS delivery_id INTEGER REFERENCES delivery_rates(id),
ADD COLUMN IF NOT EXISTS delivery_price INTEGER DEFAULT 0;

-- Agregar índice para mejor performance
CREATE INDEX IF NOT EXISTS idx_cotizaciones_delivery_id ON cotizaciones(delivery_id);

-- Verificar las columnas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'cotizaciones'
AND column_name IN ('delivery_id', 'delivery_price');

-- Mensaje de confirmación
SELECT 'Columnas de domicilio agregadas exitosamente a cotizaciones' AS status;
