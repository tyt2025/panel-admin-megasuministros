-- Agregar campo nombre_vendedor a la tabla cotizaciones
-- Este campo almacena el nombre del vendedor que realiza la cotización

ALTER TABLE cotizaciones 
ADD COLUMN IF NOT EXISTS nombre_vendedor TEXT;

-- Comentario para el campo
COMMENT ON COLUMN cotizaciones.nombre_vendedor IS 'Nombre del vendedor que realiza la cotización';
