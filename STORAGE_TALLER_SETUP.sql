-- ============================================
-- STORAGE PARA FOTOS DE TALLER
-- ============================================
-- Instrucciones para configurar el bucket en Supabase
-- ============================================

-- PASO 1: Crear el bucket
-- Ve a Storage en tu proyecto de Supabase
-- Click en "New bucket"
-- Nombre: taller-fotos
-- Configuración: PUBLIC (para que las URLs sean accesibles)

-- PASO 2: Configurar políticas de Storage (SQL)

-- Permitir leer fotos (público)
CREATE POLICY "Permitir lectura pública de fotos taller"
ON storage.objects FOR SELECT
USING (bucket_id = 'taller-fotos');

-- Permitir subir fotos (todos los usuarios autenticados)
CREATE POLICY "Permitir subir fotos al taller"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'taller-fotos');

-- Permitir actualizar fotos
CREATE POLICY "Permitir actualizar fotos del taller"
ON storage.objects FOR UPDATE
USING (bucket_id = 'taller-fotos');

-- Permitir eliminar fotos
CREATE POLICY "Permitir eliminar fotos del taller"
ON storage.objects FOR DELETE
USING (bucket_id = 'taller-fotos');

-- PASO 3: Verificación
-- En Supabase Dashboard, verifica que:
-- 1. El bucket 'taller-fotos' esté creado
-- 2. Esté marcado como PUBLIC
-- 3. Las políticas estén activas

-- NOTA: Las fotos se guardarán en la carpeta TALLER_FOTOS/ dentro del bucket
