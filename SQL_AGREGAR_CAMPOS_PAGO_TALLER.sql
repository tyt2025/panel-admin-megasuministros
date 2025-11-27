-- =====================================================
-- AGREGAR CAMPOS DE PAGO AL MÓDULO DE TALLER
-- =====================================================
-- Este script agrega los campos para manejar pagos:
-- - valor_servicio: Costo total del servicio
-- - abono: Cantidad abonada por el cliente
-- - total_pagar: Saldo pendiente (calculado automáticamente)
-- =====================================================

-- 1. Agregar columna valor_servicio (costo total del servicio)
ALTER TABLE taller 
ADD COLUMN IF NOT EXISTS valor_servicio DECIMAL(10,2) DEFAULT 0;

-- 2. Agregar columna abono (cantidad pagada)
ALTER TABLE taller 
ADD COLUMN IF NOT EXISTS abono DECIMAL(10,2) DEFAULT 0;

-- 3. Agregar columna total_pagar (saldo pendiente)
ALTER TABLE taller 
ADD COLUMN IF NOT EXISTS total_pagar DECIMAL(10,2) GENERATED ALWAYS AS (valor_servicio - abono) STORED;

-- 4. Agregar comentarios a las columnas
COMMENT ON COLUMN taller.valor_servicio IS 'Valor total del servicio de reparación/mantenimiento';
COMMENT ON COLUMN taller.abono IS 'Cantidad abonada por el cliente';
COMMENT ON COLUMN taller.total_pagar IS 'Saldo pendiente (calculado automáticamente)';

-- 5. Verificar que las columnas se crearon correctamente
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'taller' 
AND column_name IN ('valor_servicio', 'abono', 'total_pagar')
ORDER BY column_name;

-- =====================================================
-- NOTA: La columna total_pagar se calcula automáticamente
-- como: valor_servicio - abono
-- No necesitas actualizarla manualmente
-- =====================================================

-- Ejemplo de uso:
-- UPDATE taller SET valor_servicio = 50000, abono = 20000 WHERE id = 1;
-- El campo total_pagar se actualizará automáticamente a 30000
