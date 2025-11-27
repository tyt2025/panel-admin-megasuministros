-- ============================================
-- SCRIPT SQL PARA MÓDULO DE GARANTÍAS
-- Panel Admin Tintas y Tecnología
-- ============================================
-- Versión: 1.0
-- Fecha: 29 de octubre de 2025
-- 
-- INSTRUCCIONES:
-- 1. Ejecuta este script en el SQL Editor de Supabase
-- 2. Crea el bucket 'product-images' si no existe (debe ser público)
-- 3. Crea la carpeta 'GARANTIAS_EVIDENCIAS' dentro del bucket
-- ============================================

-- ============================================
-- 1. CREAR TABLA DE GARANTÍAS
-- ============================================

CREATE TABLE IF NOT EXISTS garantias (
  id BIGSERIAL PRIMARY KEY,
  vendedor_id INTEGER NOT NULL,
  
  -- Datos del cliente
  nombre_cliente VARCHAR(255) NOT NULL,
  documento VARCHAR(50) NOT NULL,
  tipo_documento VARCHAR(20) DEFAULT 'Cédula',
  
  -- Datos del producto
  referencia VARCHAR(100) NOT NULL,
  marca VARCHAR(100) NOT NULL,
  tipo_equipo VARCHAR(100) NOT NULL,
  fecha_compra DATE,
  
  -- Detalles de la garantía
  descripcion_falla TEXT NOT NULL,
  
  -- Accesorios entregados
  trae_caja BOOLEAN DEFAULT false,
  trae_cables BOOLEAN DEFAULT false,
  trae_cargador BOOLEAN DEFAULT false,
  
  -- Observaciones adicionales
  observaciones TEXT,
  
  -- Estado de la garantía
  estado VARCHAR(50) DEFAULT 'recibido',
  
  -- Fechas de auditoría
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. CREAR ÍNDICES PARA MEJORAR RENDIMIENTO
-- ============================================

CREATE INDEX IF NOT EXISTS idx_garantias_vendedor ON garantias(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_garantias_documento ON garantias(documento);
CREATE INDEX IF NOT EXISTS idx_garantias_estado ON garantias(estado);
CREATE INDEX IF NOT EXISTS idx_garantias_fecha_creacion ON garantias(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_garantias_tipo_equipo ON garantias(tipo_equipo);
CREATE INDEX IF NOT EXISTS idx_garantias_fecha_compra ON garantias(fecha_compra);

-- ============================================
-- 3. CREAR TABLA DE FOTOS DE EVIDENCIA
-- ============================================

CREATE TABLE IF NOT EXISTS garantias_fotos (
  id BIGSERIAL PRIMARY KEY,
  garantia_id BIGINT NOT NULL,
  url_foto TEXT NOT NULL,
  descripcion VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Relación con garantías (eliminación en cascada)
  CONSTRAINT fk_garantia FOREIGN KEY (garantia_id) 
    REFERENCES garantias(id) 
    ON DELETE CASCADE
);

-- ============================================
-- 4. CREAR ÍNDICE PARA FOTOS
-- ============================================

CREATE INDEX IF NOT EXISTS idx_garantias_fotos_garantia ON garantias_fotos(garantia_id);
CREATE INDEX IF NOT EXISTS idx_garantias_fotos_fecha ON garantias_fotos(created_at DESC);

-- ============================================
-- 5. HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE garantias ENABLE ROW LEVEL SECURITY;
ALTER TABLE garantias_fotos ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. CREAR POLÍTICAS DE SEGURIDAD PARA GARANTÍAS
-- ============================================

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Permitir lectura de garantías" ON garantias;
DROP POLICY IF EXISTS "Permitir inserción de garantías" ON garantias;
DROP POLICY IF EXISTS "Permitir actualización de garantías" ON garantias;
DROP POLICY IF EXISTS "Permitir eliminación de garantías" ON garantias;

-- Crear nuevas políticas
CREATE POLICY "Permitir lectura de garantías"
  ON garantias FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserción de garantías"
  ON garantias FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir actualización de garantías"
  ON garantias FOR UPDATE
  USING (true);

CREATE POLICY "Permitir eliminación de garantías"
  ON garantias FOR DELETE
  USING (true);

-- ============================================
-- 7. CREAR POLÍTICAS DE SEGURIDAD PARA FOTOS
-- ============================================

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Permitir lectura de fotos" ON garantias_fotos;
DROP POLICY IF EXISTS "Permitir inserción de fotos" ON garantias_fotos;
DROP POLICY IF EXISTS "Permitir eliminación de fotos" ON garantias_fotos;

-- Crear nuevas políticas
CREATE POLICY "Permitir lectura de fotos"
  ON garantias_fotos FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserción de fotos"
  ON garantias_fotos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir eliminación de fotos"
  ON garantias_fotos FOR DELETE
  USING (true);

-- ============================================
-- 8. CREAR FUNCIÓN PARA ACTUALIZAR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. CREAR TRIGGER PARA AUTO-ACTUALIZAR updated_at
-- ============================================

DROP TRIGGER IF EXISTS update_garantias_updated_at ON garantias;

CREATE TRIGGER update_garantias_updated_at
  BEFORE UPDATE ON garantias
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 10. COMENTARIOS EN LAS TABLAS
-- ============================================

COMMENT ON TABLE garantias IS 'Tabla de garantías de productos';
COMMENT ON TABLE garantias_fotos IS 'Fotos de evidencia para garantías';

COMMENT ON COLUMN garantias.vendedor_id IS 'ID del vendedor que registró la garantía';
COMMENT ON COLUMN garantias.nombre_cliente IS 'Nombre completo del cliente';
COMMENT ON COLUMN garantias.documento IS 'NIT o cédula del cliente';
COMMENT ON COLUMN garantias.referencia IS 'Referencia del producto';
COMMENT ON COLUMN garantias.marca IS 'Marca del producto';
COMMENT ON COLUMN garantias.tipo_equipo IS 'Tipo de equipo (computador, impresora, etc.)';
COMMENT ON COLUMN garantias.fecha_compra IS 'Fecha de compra del producto';
COMMENT ON COLUMN garantias.descripcion_falla IS 'Descripción detallada de la falla';
COMMENT ON COLUMN garantias.trae_caja IS 'Indica si el cliente trajo la caja original';
COMMENT ON COLUMN garantias.trae_cables IS 'Indica si el cliente trajo los cables';
COMMENT ON COLUMN garantias.trae_cargador IS 'Indica si el cliente trajo el cargador';
COMMENT ON COLUMN garantias.observaciones IS 'Observaciones adicionales (rayones, golpes, etc.)';
COMMENT ON COLUMN garantias.estado IS 'Estado actual de la garantía';

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

-- VERIFICACIÓN: Ejecuta estas consultas para verificar la instalación
-- SELECT COUNT(*) FROM garantias;
-- SELECT COUNT(*) FROM garantias_fotos;
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'garantias%';

-- ============================================
-- CONFIGURACIÓN ADICIONAL EN SUPABASE
-- ============================================
-- 
-- IMPORTANTE: Después de ejecutar este script, realiza lo siguiente en Supabase:
--
-- 1. STORAGE (Almacenamiento):
--    - Ve a Storage en el panel de Supabase
--    - El bucket 'product-images' ya debe existir (se usa para productos)
--    - Si no existe, créalo como PÚBLICO
--    - Dentro del bucket, crea la carpeta: GARANTIAS_EVIDENCIAS
--
-- 2. POLÍTICAS DE STORAGE:
--    - Las políticas del bucket 'product-images' deben permitir:
--      a) Lectura pública (SELECT)
--      b) Inserción (INSERT) para usuarios autenticados
--      c) Eliminación (DELETE) para usuarios autenticados
--
-- 3. PERMISOS:
--    - Verifica que la tabla 'vendedores' exista
--    - Los vendedor_id deben coincidir con los IDs en la tabla vendedores
--
-- ============================================

-- DATOS DE PRUEBA (OPCIONAL - Descomenta para insertar)
-- 
-- INSERT INTO garantias (
--   vendedor_id, nombre_cliente, documento, referencia, marca,
--   tipo_equipo, fecha_compra, descripcion_falla, 
--   trae_caja, trae_cables, trae_cargador, observaciones, estado
-- ) VALUES (
--   1, 'Juan Pérez', '1234567890', 'HP Pavilion 15-dx0001la', 'HP',
--   'laptop', '2025-01-15', 'El equipo no enciende, solo muestra luz azul',
--   true, true, true, 'Equipo con rayón pequeño en la tapa', 'recibido'
-- );
