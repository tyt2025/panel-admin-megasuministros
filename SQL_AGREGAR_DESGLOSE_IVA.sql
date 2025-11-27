-- =============================================
-- AGREGAR CAMPO DE DESGLOSE IVA A COTIZACIONES
-- =============================================
-- Ejecutar en Supabase SQL Editor
-- Fecha: Noviembre 2025
-- Proyecto: Panel Admin Tintas - Corrección Desglose IVA

-- Agregar columna para guardar si se debe mostrar el desglose del IVA
ALTER TABLE cotizaciones
ADD COLUMN IF NOT EXISTS mostrar_desglose_iva BOOLEAN DEFAULT false;

-- Agregar columna para guardar el monto del IVA calculado
ALTER TABLE cotizaciones
ADD COLUMN IF NOT EXISTS iva_monto NUMERIC(10,2) DEFAULT 0;

-- Agregar columna para guardar la base imponible
ALTER TABLE cotizaciones
ADD COLUMN IF NOT EXISTS base_imponible NUMERIC(10,2) DEFAULT 0;

-- Verificar las columnas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'cotizaciones'
AND column_name IN ('mostrar_desglose_iva', 'iva_monto', 'base_imponible');

-- Mensaje de confirmación
SELECT 'Columnas de desglose IVA agregadas exitosamente a cotizaciones' AS status;
