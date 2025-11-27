# 🛠️ MÓDULO DE TALLER - Documentación Completa

## 📋 Descripción General

El módulo de **Taller** permite registrar y gestionar servicios de:
- 🔧 **Mantenimiento**: Limpieza y mantenimiento preventivo
- ⚙️ **Reparación**: Reparar fallas o daños
- 🔍 **Revisión**: Diagnóstico y cotización

## ✨ Características Principales

### ✅ Registro de Servicios
- Tipo de servicio (mantenimiento, reparación, revisión)
- Datos del cliente (nombre, teléfono)
- Datos del equipo (referencia, tipo, marca)
- Registro de accesorios (cables, cargador, caja, otros)
- Observaciones detalladas del estado
- **Carga de múltiples fotos** (hasta 10 fotos, 5MB cada una)

### ✅ Gestión de Estados
- 📥 **Recibido**: Equipo recién ingresado
- 🔍 **En Diagnóstico**: Revisando el equipo
- ⚙️ **Reparando**: En proceso de reparación
- ✅ **Listo**: Reparación completada
- 📤 **Entregado**: Cliente recogió el equipo
- ❌ **Sin Solución**: No se pudo reparar
- 🚫 **Abandonado**: Más de 90 días sin recoger

### ✅ Funcionalidades Adicionales
- Búsqueda por cliente, teléfono, referencia o marca
- Filtrado por estado
- Estadísticas en tiempo real
- Contador de días transcurridos
- **Aviso automático de productos abandonados** (90 días)
- Galería de fotos con vista ampliada
- Historial de fechas (ingreso, actualización, entrega)

## 📁 Estructura de Archivos

```
app/taller/
├── layout.js           # Layout del módulo
├── page.js             # Lista de servicios
├── nuevo/
│   └── page.js         # Formulario de registro
└── [id]/
    └── page.js         # Detalle del servicio
```

## 🗄️ Estructura de la Base de Datos

### Tabla: `taller`

```sql
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
    
    -- Accesorios
    trae_cables BOOLEAN DEFAULT FALSE,
    trae_cargador BOOLEAN DEFAULT FALSE,
    trae_caja BOOLEAN DEFAULT FALSE,
    otros_accesorios TEXT,
    
    -- Observaciones y fotos
    observaciones TEXT,
    fotos TEXT[], -- Array de URLs
    
    -- Estado
    estado VARCHAR(50) DEFAULT 'recibido',
    
    -- Fechas
    fecha_ingreso TIMESTAMP DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP DEFAULT NOW(),
    fecha_entrega TIMESTAMP,
    
    -- Costos (opcional)
    costo_reparacion DECIMAL(10,2),
    costo_repuestos DECIMAL(10,2),
    
    -- Notas internas
    notas_tecnico TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## 📦 Configuración de Storage

### Bucket: `taller-fotos`
- **Tipo**: Público
- **Carpeta**: `TALLER_FOTOS/`
- **Formato de archivos**: `{timestamp}-{random}.{extension}`
- **Tamaño máximo**: 5MB por foto
- **Cantidad máxima**: 10 fotos por servicio

### Formatos permitidos:
- JPG / JPEG
- PNG
- GIF
- WEBP

## 🎯 Guía de Uso

### 1. Registrar Nuevo Servicio

1. **Dashboard** → Click en "🛠️ Registrar en Taller"
   - O desde el menú lateral: **Taller** → "+ Registrar Nuevo Servicio"

2. **Seleccionar tipo de servicio**:
   - Mantenimiento
   - Reparación
   - Revisión

3. **Datos del Cliente**:
   - Nombre completo (obligatorio)
   - Teléfono (obligatorio)

4. **Datos del Equipo**:
   - Referencia/Modelo (obligatorio)
   - Tipo de equipo (obligatorio)
   - Marca (obligatoria)

5. **Accesorios que trae**:
   - ✓ Cables
   - ✓ Cargador
   - ✓ Caja
   - Otros accesorios (campo de texto)

6. **Observaciones**:
   - Describe el estado: rayones, golpes, partes faltantes, etc.

7. **Fotos** (opcional):
   - Click en "Subir Fotos"
   - Selecciona hasta 10 fotos
   - Vista previa automática
   - Puedes eliminar fotos antes de guardar

8. **Click en "✅ Registrar Servicio"**

### 2. Ver Lista de Servicios

1. **Menú lateral** → "Taller"
2. Ver estadísticas por estado
3. **Buscar** por cliente, teléfono, referencia o marca
4. **Filtrar** por estado
5. **Click en "Ver Detalle"** para abrir un servicio

### 3. Ver Detalle del Servicio

Desde la página de detalle puedes:
- Ver toda la información del servicio
- Ver las fotos (click para ampliar)
- Ver días transcurridos desde el ingreso
- **Cambiar el estado** del servicio
- **Eliminar** el servicio (con confirmación doble)

### 4. Cambiar Estado

Estados disponibles:
- 📥 **Recibido**: Estado inicial
- 🔍 **En Diagnóstico**: Revisando el problema
- ⚙️ **Reparando**: En proceso de reparación
- ✅ **Listo**: Reparación completada, listo para entrega
- 📤 **Entregado**: Cliente recogió el equipo
- ❌ **Sin Solución**: No se pudo reparar
- 🚫 **Abandonado**: Más de 90 días sin recoger

## ⚖️ Marco Legal - Productos Abandonados

### Ley Aplicable en Colombia

De acuerdo con el **Código de Comercio de Colombia**:

**Artículos 669 y siguientes** sobre el contrato de depósito mercantil establecen que:

> Después de **90 días calendario** sin que el cliente reclame su equipo, este será considerado como **PRODUCTO ABANDONADO**.

### Consecuencias:

El equipo podrá ser:
- ✓ Vendido para recuperar costos de almacenamiento
- ✓ Reciclado o desechado según corresponda
- ✓ Donado a instituciones sin ánimo de lucro

### Notificaciones:

- El cliente será notificado antes de que se cumpla el plazo de 90 días
- El sistema muestra alertas automáticas:
  - 🟢 **+60 días restantes**: Alerta azul
  - 🟡 **30-60 días restantes**: Alerta amarilla
  - 🔴 **-30 días restantes**: Alerta roja crítica

## 📊 Estadísticas del Dashboard

El módulo de Taller agrega:
- **Tarjeta de contador** en el dashboard principal
- **Botón de acción rápida** para registrar servicios
- **Estadísticas en tiempo real** por estado

## 🔧 Instalación y Configuración

### 1. Ejecutar SQL para crear la tabla

```bash
# En Supabase SQL Editor, ejecuta:
CREAR_TABLA_TALLER.sql
```

### 2. Configurar Storage

```bash
# En Supabase SQL Editor, ejecuta:
STORAGE_TALLER_SETUP.sql
```

**O manualmente en Supabase Dashboard**:
1. Ve a **Storage**
2. Click en "**New bucket**"
3. Nombre: `taller-fotos`
4. Configuración: **PUBLIC**
5. Ejecuta las políticas del archivo SQL

### 3. Verificar Variables de Entorno

Las variables ya existentes funcionan para este módulo:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

## 🐛 Solución de Problemas

### Error: "Tabla 'taller' no existe"
**Solución**: Ejecuta el archivo `CREAR_TABLA_TALLER.sql` en Supabase

### Error al subir fotos
**Causa**: Bucket no configurado o políticas incorrectas  
**Solución**:
1. Verifica que el bucket `taller-fotos` exista
2. Confirma que sea público
3. Ejecuta `STORAGE_TALLER_SETUP.sql`

### Las fotos no se ven
**Causa**: URLs incorrectas o bucket privado  
**Solución**: Asegúrate de que el bucket `taller-fotos` sea PUBLIC

### Error: "Archivo muy grande"
**Causa**: Foto mayor a 5MB  
**Solución**: Comprime la imagen antes de subirla

## 📝 Próximas Mejoras Sugeridas

- [ ] Enviar notificaciones por WhatsApp automáticamente
- [ ] Generar PDF del ticket de servicio
- [ ] Sistema de costos y presupuestos
- [ ] Historial de cambios de estado
- [ ] Notas del técnico
- [ ] Reportes de servicios del mes
- [ ] Filtro por rango de fechas
- [ ] Exportar lista a Excel
- [ ] Firma digital del cliente
- [ ] Recordatorios automáticos (60 días, 80 días, 90 días)

## 🆕 Características Técnicas

### Validaciones del Formulario
- ✓ Nombre del cliente (obligatorio)
- ✓ Teléfono del cliente (obligatorio)
- ✓ Referencia del equipo (obligatoria)
- ✓ Marca del equipo (obligatoria)
- ✓ Máximo 10 fotos
- ✓ Máximo 5MB por foto
- ✓ Solo imágenes (JPG, PNG, GIF, WEBP)

### Performance
- Carga de fotos optimizada
- Preview instantáneo
- Subida asíncrona de fotos
- Indicador de progreso

### Seguridad
- Validación de tipos de archivo
- Validación de tamaño
- Nombres únicos de archivo (timestamp + random)
- Row Level Security (RLS) en Supabase

## 📞 Soporte

Para dudas o problemas con el módulo de Taller:
1. Revisa esta documentación
2. Verifica los logs en la consola del navegador (F12)
3. Revisa que las tablas y buckets estén correctamente configurados
4. Confirma que las variables de entorno sean correctas

---

**Desarrollado con ❤️ para Tintas y Tecnología**

🛠️ **Módulo de Taller v1.0 - Octubre 2025**
