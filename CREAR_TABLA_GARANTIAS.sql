-- Tabla de Garantías para Panel Admin Tintas
-- Ejecutar este script en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.garantias (
    id BIGSERIAL PRIMARY KEY,
    nombre_cliente VARCHAR(255) NOT NULL,
    documento VARCHAR(50) NOT NULL,
    referencia VARCHAR(255) NOT NULL,
    marca VARCHAR(100) NOT NULL,
    tipo_equipo VARCHAR(50) NOT NULL,
    fecha_compra DATE,
    descripcion_falla TEXT NOT NULL,
    trae_caja BOOLEAN DEFAULT FALSE,
    trae_cables BOOLEAN DEFAULT FALSE,
    trae_cargador BOOLEAN DEFAULT FALSE,
    observaciones TEXT,
    estado VARCHAR(50) DEFAULT 'recibido',
    vendedor_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_garantias_vendedor ON public.garantias(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_garantias_estado ON public.garantias(estado);
CREATE INDEX IF NOT EXISTS idx_garantias_documento ON public.garantias(documento);
CREATE INDEX IF NOT EXISTS idx_garantias_fecha ON public.garantias(created_at DESC);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_garantias_updated_at 
    BEFORE UPDATE ON public.garantias
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.garantias ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad (opcional, ajustar según necesidades)
-- Permitir a todos los usuarios autenticados leer y escribir
CREATE POLICY "Enable read access for all users" ON public.garantias
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.garantias
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON public.garantias
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON public.garantias
    FOR DELETE USING (true);

-- Comentarios para documentación
COMMENT ON TABLE public.garantias IS 'Tabla para gestionar productos en garantía';
COMMENT ON COLUMN public.garantias.nombre_cliente IS 'Nombre completo del cliente';
COMMENT ON COLUMN public.garantias.documento IS 'NIT o número de cédula del cliente';
COMMENT ON COLUMN public.garantias.referencia IS 'Referencia o modelo del producto';
COMMENT ON COLUMN public.garantias.marca IS 'Marca del producto';
COMMENT ON COLUMN public.garantias.tipo_equipo IS 'Tipo de equipo: computador, impresora, etc.';
COMMENT ON COLUMN public.garantias.fecha_compra IS 'Fecha en que se compró el producto';
COMMENT ON COLUMN public.garantias.descripcion_falla IS 'Descripción detallada del problema';
COMMENT ON COLUMN public.garantias.trae_caja IS 'Indica si trae caja original';
COMMENT ON COLUMN public.garantias.trae_cables IS 'Indica si trae cables';
COMMENT ON COLUMN public.garantias.trae_cargador IS 'Indica si trae cargador';
COMMENT ON COLUMN public.garantias.observaciones IS 'Observaciones adicionales (rayones, golpes, etc.)';
COMMENT ON COLUMN public.garantias.estado IS 'Estado actual: recibido, en_revision, reparado, entregado, sin_solucion';
COMMENT ON COLUMN public.garantias.vendedor_id IS 'ID del vendedor que registró la garantía';
