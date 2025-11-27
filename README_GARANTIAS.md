# 🔧 MÓDULO DE GARANTÍAS - Panel Admin Tintas y Tecnología

## 📋 CONTENIDO ACTUALIZADO

Este paquete incluye el **módulo completo de garantías** con todas las funcionalidades solicitadas:

### ✨ Características Implementadas

1. **✅ Registro Completo de Garantías**
   - Nombre del cliente
   - NIT o Cédula
   - Referencia del producto
   - Marca del producto
   - Tipo de equipo (computador, laptop, impresora, monitor, etc.)
   - Fecha de compra
   - Descripción detallada de la falla
   - Checkboxes para accesorios:
     - ✓ Trae caja original
     - ✓ Trae cables
     - ✓ Trae cargador
   - Campo de observaciones para notas adicionales (rayones, golpes, etc.)
   - Estados configurables (Recibido, En Revisión, Reparado, Entregado, Sin Solución)

2. **📸 Sistema de Fotos de Evidencia**
   - Carga múltiple de imágenes (arrastra y suelta o click)
   - Vista previa antes de guardar
   - Validación de tamaño (máx 5MB por imagen)
   - Formatos soportados: JPG, PNG, WEBP, GIF
   - Almacenamiento en Supabase Storage
   - Visualización en galería en el detalle
   - Modal de vista completa al hacer click
   - Eliminación de fotos antes de guardar

3. **📊 Gestión Completa**
   - Lista de garantías con búsqueda
   - Vista detallada de cada garantía
   - Cambio de estado con un click
   - Información organizada por secciones
   - Diseño responsive y moderno

---

## 🚀 INSTALACIÓN RÁPIDA

### Paso 1: Configurar Base de Datos

1. **Abre Supabase** (https://cxxifwpwarbrrodtzyqn.supabase.co)
2. Ve a **SQL Editor**
3. **Copia y pega** el contenido del archivo `GARANTIAS_SETUP.sql`
4. **Ejecuta** el script (botón "Run")
5. Verifica que las tablas se crearon correctamente

### Paso 2: Configurar Storage

1. Ve a **Storage** en Supabase
2. El bucket `product-images` debe existir (se usa también para productos)
3. Si no existe, créalo como **PÚBLICO**
4. Dentro del bucket, asegúrate de tener permisos de lectura y escritura

### Paso 3: Subir el Código a GitHub

```bash
# Navega a la carpeta del proyecto
cd panel-admin-tintas-garantias

# Agrega todos los archivos
git add .

# Haz commit con mensaje descriptivo
git commit -m "✨ Agregar módulo de garantías con sistema de fotos"

# Sube a GitHub
git push origin main
```

### Paso 4: Vercel Redesplegar Automáticamente

Vercel detectará los cambios y redesplegar automáticamente. Si no:

1. Ve a tu proyecto en Vercel
2. Click en "Deployments"
3. Click en "Redeploy" en el último deployment

---

## 📁 ARCHIVOS MODIFICADOS/CREADOS

### Archivos Nuevos:
```
/app/garantias/
├── layout.js (ya existía)
├── page.js (actualizado con mejoras)
├── nueva/
│   └── page.js (actualizado con sistema de fotos)
└── [id]/
    └── page.js (actualizado con visualización de fotos)

GARANTIAS_SETUP.sql (script SQL completo)
README_GARANTIAS.md (este archivo)
```

### Archivos Modificados:
- ✅ `/app/garantias/nueva/page.js` - Agregado sistema de carga de fotos
- ✅ `/app/garantias/[id]/page.js` - Agregada visualización de fotos con modal
- ✅ `/components/Sidebar.js` - Ya incluye enlace a Garantías

### Sin Cambios:
- ✅ Todas las demás funcionalidades (cotizaciones, productos, clientes, reportes)

---

## 🗄️ ESTRUCTURA DE BASE DE DATOS

### Tabla: `garantias`
```sql
- id (BIGSERIAL PRIMARY KEY)
- vendedor_id (INTEGER) - Relación con vendedores
- nombre_cliente (VARCHAR) - Nombre del cliente
- documento (VARCHAR) - NIT o Cédula
- referencia (VARCHAR) - Referencia del producto
- marca (VARCHAR) - Marca del producto
- tipo_equipo (VARCHAR) - Tipo (computador, impresora, etc.)
- fecha_compra (DATE) - Fecha de compra
- descripcion_falla (TEXT) - Descripción de la falla
- trae_caja (BOOLEAN) - Si trajo caja
- trae_cables (BOOLEAN) - Si trajo cables
- trae_cargador (BOOLEAN) - Si trajo cargador
- observaciones (TEXT) - Notas adicionales
- estado (VARCHAR) - Estado actual
- created_at (TIMESTAMP) - Fecha de creación
- updated_at (TIMESTAMP) - Última actualización
```

### Tabla: `garantias_fotos`
```sql
- id (BIGSERIAL PRIMARY KEY)
- garantia_id (BIGINT) - Relación con garantías (CASCADE)
- url_foto (TEXT) - URL de la foto en Storage
- descripcion (VARCHAR) - Descripción opcional
- created_at (TIMESTAMP) - Fecha de subida
```

---

## 📸 ALMACENAMIENTO DE FOTOS

### Ubicación en Supabase Storage:
- **Bucket:** `product-images` (público)
- **Carpeta:** `GARANTIAS_EVIDENCIAS/`
- **Formato de nombre:** `{timestamp}-{random}.{extensión}`
- **Tamaño máximo:** 5MB por imagen
- **Formatos permitidos:** JPG, PNG, WEBP, GIF

---

## 🎯 GUÍA DE USO

### 1. Registrar una Garantía

1. **Dashboard** → Click en "Garantías" en el menú lateral
2. Click en **"+ Nueva Garantía"**
3. **Llenar datos del cliente:**
   - Nombre completo
   - NIT o Cédula

4. **Llenar datos del producto:**
   - Referencia (ej: HP Pavilion 15)
   - Marca (ej: HP, Epson, Canon)
   - Tipo de equipo (seleccionar de la lista)
   - Fecha de compra (opcional)
   - Descripción detallada de la falla

5. **Marcar accesorios que trae:**
   - ✓ Caja original
   - ✓ Cables
   - ✓ Cargador

6. **Subir fotos de evidencia (opcional):**
   - Click en el área de carga o arrastra imágenes
   - Puedes subir múltiples fotos
   - Vista previa antes de guardar
   - Click en la X para eliminar una foto antes de guardar

7. **Agregar observaciones (opcional):**
   - Ejemplo: "Equipo con rayón en la tapa"
   - Ejemplo: "Golpe en esquina inferior"

8. **Seleccionar estado inicial**
9. Click en **"Registrar Garantía"**

### 2. Ver Garantías

1. **"Garantías"** en el menú lateral
2. Ver lista de todas las garantías
3. Click en **"Ver"** para abrir el detalle
4. En el detalle verás:
   - Todos los datos del cliente y producto
   - Estado actual (editable)
   - Accesorios incluidos
   - Fotos de evidencia (click para ampliar)
   - Observaciones
   - Fechas de registro y actualización

### 3. Ver Fotos en Detalle

- Las fotos aparecen en una galería
- Click en cualquier foto para verla en tamaño completo
- Click fuera de la imagen o en la X para cerrar

---

## 🎨 ESTADOS DISPONIBLES

1. **Recibido** 🔵 - Producto recién ingresado
2. **En Revisión** 🟡 - En proceso de diagnóstico
3. **Reparado** 🟢 - Reparación completada
4. **Entregado** ⚫ - Devuelto al cliente
5. **Sin Solución** 🔴 - No se pudo reparar

---

## 🔧 TIPOS DE EQUIPO DISPONIBLES

- Computador
- Laptop
- Impresora
- Monitor
- Teclado
- Mouse
- Tablet
- Celular
- Disco Duro
- Memoria RAM
- Otro

*Puedes agregar más tipos editando el select en `/app/garantias/nueva/page.js`*

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error al subir fotos
**Causa:** Bucket no configurado o permisos incorrectos
**Solución:**
1. Verifica que el bucket `product-images` exista y sea público
2. Verifica los permisos de Storage en Supabase
3. Asegúrate que las políticas permitan INSERT

### Las fotos no se visualizan
**Causa:** URLs no públicas o bucket no público
**Solución:**
1. Ve a Storage → product-images → Configuration
2. Asegúrate que "Public bucket" esté activado

### Error: "Table garantias does not exist"
**Causa:** No se ejecutó el script SQL
**Solución:**
1. Ve a SQL Editor en Supabase
2. Ejecuta el archivo `GARANTIAS_SETUP.sql` completo

### Las garantías no aparecen
**Causa:** Problema con el vendedor_id
**Solución:**
1. Verifica que el usuario tenga un vendedor_id válido
2. Revisa en la consola del navegador (F12) si hay errores

---

## 📊 MEJORAS FUTURAS SUGERIDAS

- [ ] Sistema de notificaciones cuando cambia el estado
- [ ] Generar PDF de la garantía con fotos
- [ ] Firma digital del cliente al recibir
- [ ] Historial de cambios de estado
- [ ] Enviar WhatsApp al cliente con update
- [ ] Agregar campo de costo de reparación
- [ ] Tiempo estimado de reparación
- [ ] Exportar garantías a Excel
- [ ] Dashboard de estadísticas de garantías

---

## ✅ VERIFICACIÓN POST-INSTALACIÓN

Después de desplegar, verifica que:

- [ ] Puedes acceder a "Garantías" desde el menú
- [ ] Puedes crear una nueva garantía
- [ ] Puedes subir fotos
- [ ] Las fotos se visualizan en el detalle
- [ ] Puedes cambiar el estado
- [ ] La lista de garantías carga correctamente

---

## 📞 SOPORTE

Si encuentras algún problema:

1. Revisa la consola del navegador (F12)
2. Verifica los logs en Vercel
3. Confirma que el SQL se ejecutó correctamente
4. Verifica las variables de entorno en Vercel

---

## 📝 NOTAS IMPORTANTES

- Las fotos se almacenan en el mismo bucket que las imágenes de productos
- El tamaño máximo por foto es 5MB
- Se recomienda comprimir imágenes grandes antes de subirlas
- Las fotos se eliminan automáticamente si se borra la garantía (CASCADE)
- El módulo respeta el mismo sistema de autenticación existente

---

**¡Módulo de Garantías Listo para Producción! 🚀**

---

**Desarrollado con ❤️ para Tintas y Tecnología**

Fecha: 29 de octubre de 2025
Versión: 1.0
