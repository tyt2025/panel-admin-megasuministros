-- ============================================
-- TABLA TALLER - Panel Admin Tintas
-- ============================================
-- Esta tabla almacena los registros de servicios
-- de taller (mantenimiento, reparación, revisión)
-- ============================================

-- Eliminar tabla si existe (cuidado en producción)
DROP TABLE IF EXISTS public.taller CASCADE;

-- Crear tabla taller
CREATE TABLE public.taller (
    id BIGSERIAL PRIMARY KEY,
    vendedor_id INTEGER NOT NULL,
    
    -- Tipo de servicio
    tipo_servicio VARCHAR(50) NOT NULL CHECK (tipo_servicio IN ('mantenimiento', 'reparacion', 'revision')),
    
    -- Datos del cliente
    nombre_cliente VARCHAR(255) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    
    -- Datos del equipo
    referencia VARCHAR(255) NOT NULL,
    tipo_equipo VARCHAR(100) NOT NULL,
    marca VARCHAR(100) NOT NULL,
    
    -- Accesorios (checkboxes)
    trae_cables BOOLEAN DEFAULT FALSE,
    trae_cargador BOOLEAN DEFAULT FALSE,
    trae_caja BOOLEAN DEFAULT FALSE,
    otros_accesorios TEXT,
    
    -- Observaciones y fotos
    observaciones TEXT,
    fotos TEXT[], -- Array de URLs de las imágenes
    
    -- Estado del servicio
    estado VARCHAR(50) DEFAULT 'recibido' CHECK (estado IN ('recibido', 'diagnostico', 'reparando', 'listo', 'entregado', 'sin_solucion', 'abandonado')),
    
    -- Fechas
    fecha_ingreso TIMESTAMP DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP DEFAULT NOW(),
    fecha_entrega TIMESTAMP,
    
    -- Costos (opcional para futuras mejoras)
    costo_reparacion DECIMAL(10,2),
    costo_repuestos DECIMAL(10,2),
    
    -- Notas internas
    notas_tecnico TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_taller_vendedor ON public.taller(vendedor_id);
CREATE INDEX idx_taller_estado ON public.taller(estado);
CREATE INDEX idx_taller_tipo_servicio ON public.taller(tipo_servicio);
CREATE INDEX idx_taller_fecha_ingreso ON public.taller(fecha_ingreso);
CREATE INDEX idx_taller_nombre_cliente ON public.taller(nombre_cliente);
CREATE INDEX idx_taller_telefono ON public.taller(telefono);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_taller_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
CREATE TRIGGER taller_updated_at_trigger
    BEFORE UPDATE ON public.taller
    FOR EACH ROW
    EXECUTE FUNCTION update_taller_updated_at();

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.taller ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer (ajustar según necesidades)
CREATE POLICY "Enable read access for all users" ON public.taller
    FOR SELECT USING (true);

-- Política: Todos pueden insertar (ajustar según necesidades)
CREATE POLICY "Enable insert access for all users" ON public.taller
    FOR INSERT WITH CHECK (true);

-- Política: Todos pueden actualizar (ajustar según necesidades)
CREATE POLICY "Enable update access for all users" ON public.taller
    FOR UPDATE USING (true);

-- Política: Todos pueden eliminar (ajustar según necesidades)
CREATE POLICY "Enable delete access for all users" ON public.taller
    FOR DELETE USING (true);

-- Comentarios de la tabla
COMMENT ON TABLE public.taller IS 'Tabla para gestionar servicios de taller (mantenimiento, reparación, revisión)';
COMMENT ON COLUMN public.taller.tipo_servicio IS 'Tipo de servicio: mantenimiento, reparacion, revision';
COMMENT ON COLUMN public.taller.estado IS 'Estado actual: recibido, diagnostico, reparando, listo, entregado, sin_solucion, abandonado';
COMMENT ON COLUMN public.taller.fotos IS 'Array de URLs de las fotos del equipo';

-- Verificar creación
SELECT 'Tabla TALLER creada exitosamente' AS status;
