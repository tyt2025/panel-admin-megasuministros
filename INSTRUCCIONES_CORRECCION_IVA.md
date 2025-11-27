# 🔧 CORRECCIÓN: DESGLOSE DE IVA EN PDF DE COTIZACIÓN

## 📋 PROBLEMA IDENTIFICADO
Cuando se activaba el "desglose del IVA" en la creación de cotización, este se mostraba correctamente en la interfaz, pero no se guardaba en la base de datos ni aparecía en el PDF generado.

## ✅ SOLUCIÓN IMPLEMENTADA

### 1. CAMBIOS EN LA BASE DE DATOS
Se agregaron 3 nuevas columnas a la tabla `cotizaciones`:
- `mostrar_desglose_iva` (BOOLEAN): Indica si se debe mostrar el desglose
- `iva_monto` (NUMERIC): Monto del IVA calculado
- `base_imponible` (NUMERIC): Base imponible sin IVA

### 2. ARCHIVOS MODIFICADOS

#### A. SQL_AGREGAR_DESGLOSE_IVA.sql
Nuevo archivo SQL para agregar las columnas necesarias en Supabase.

#### B. app/cotizaciones/nueva/page.js
- Se agregaron los campos `mostrar_desglose_iva`, `iva_monto` y `base_imponible` al insert de cotización
- Ahora guarda correctamente el estado del desglose al crear una cotización

#### C. app/cotizaciones/[id]/page.js
- Se actualizó la generación del PDF para mostrar el desglose de IVA cuando corresponde
- Se actualizó la vista HTML para mostrar el desglose de IVA en pantalla
- El desglose muestra: Base imponible, IVA (19%), y Subtotal con IVA

#### D. app/cotizaciones/[id]/editar/page.js
- Se agregó el estado `mostrarDesglose` para manejar esta opción
- Se actualizó la función `calcularTotales()` para calcular el desglose
- Se agregó el checkbox en la interfaz para activar/desactivar el desglose
- Se actualizó el update de cotización para guardar los nuevos campos
- Se actualizó la visualización de totales para mostrar el desglose

## 🚀 INSTRUCCIONES DE IMPLEMENTACIÓN

### PASO 1: Ejecutar el SQL en Supabase
1. Ve a tu proyecto en Supabase
2. Abre el SQL Editor
3. Copia y pega el contenido del archivo `SQL_AGREGAR_DESGLOSE_IVA.sql`
4. Ejecuta el script
5. Verifica que las columnas se hayan creado correctamente

### PASO 2: Actualizar los archivos en GitHub
1. Reemplaza estos archivos en tu repositorio de GitHub:
   - `app/cotizaciones/nueva/page.js`
   - `app/cotizaciones/[id]/page.js`
   - `app/cotizaciones/[id]/editar/page.js`

2. Métodos para actualizar:

   **Opción A: Usando GitHub Web**
   - Ve a cada archivo en GitHub
   - Click en "Edit" (lápiz)
   - Reemplaza el contenido con el nuevo archivo
   - Commit los cambios

   **Opción B: Usando Git**
   ```bash
   # Clona tu repositorio si no lo has hecho
   git clone TU_URL_REPOSITORIO
   cd TU_REPOSITORIO
   
   # Copia los archivos modificados
   # (coloca los archivos nuevos en las carpetas correspondientes)
   
   # Agrega los cambios
   git add app/cotizaciones/nueva/page.js
   git add app/cotizaciones/[id]/page.js
   git add app/cotizaciones/[id]/editar/page.js
   
   # Haz commit
   git commit -m "Fix: Agregar desglose de IVA en PDF de cotización"
   
   # Sube los cambios
   git push origin main
   ```

### PASO 3: Verificar el Despliegue en Vercel
1. Vercel detectará automáticamente los cambios en GitHub
2. Iniciará un nuevo despliegue
3. Espera a que termine (1-2 minutos)
4. Verifica que el despliegue fue exitoso

### PASO 4: Probar la Funcionalidad
1. Crea una nueva cotización
2. Activa el checkbox "Mostrar desglose de IVA (19%)"
3. Completa la cotización
4. Verifica que en la vista previa se muestre el desglose
5. Descarga el PDF
6. **VERIFICA** que el PDF muestre:
   - Base imponible
   - IVA (19%)
   - Subtotal (con IVA)

## 📝 NOTAS IMPORTANTES

### Sobre el Cálculo del IVA
Cuando el desglose está activo:
- Los precios ingresados YA INCLUYEN el IVA
- Base imponible = Precio total / 1.19
- IVA (19%) = Precio total - Base imponible
- Subtotal (con IVA) = Precio total

### Retrocompatibilidad
- Las cotizaciones existentes sin desglose seguirán funcionando normalmente
- El campo `mostrar_desglose_iva` por defecto es `false`
- Las cotizaciones antiguas no mostrarán el desglose en el PDF

### Edición de Cotizaciones
- Al editar una cotización con desglose, el checkbox se marcará automáticamente
- Puedes activar/desactivar el desglose al editar
- Los cálculos se actualizarán en tiempo real

## 🐛 SOLUCIÓN DE PROBLEMAS

### El PDF no muestra el desglose
- Verifica que ejecutaste el SQL en Supabase
- Confirma que los archivos se actualizaron en GitHub
- Limpia la caché de tu navegador
- Crea una NUEVA cotización (las anteriores no tienen el campo)

### Error al crear cotización
- Verifica que las columnas existen en Supabase
- Revisa la consola del navegador (F12) para ver errores
- Confirma que Vercel desplegó correctamente

### Los cálculos no coinciden
- Recuerda que cuando el desglose está activo, los precios YA INCLUYEN IVA
- La base imponible siempre será menor que el subtotal
- El IVA es el 19% de la base imponible (no del subtotal)

## 📞 SOPORTE

Si tienes algún problema:
1. Revisa los logs de Vercel para ver errores de despliegue
2. Verifica la consola del navegador (F12) para errores de JavaScript
3. Confirma que los archivos en GitHub tienen los cambios correctos
4. Verifica que el SQL se ejecutó correctamente en Supabase

## ✨ RESULTADO FINAL

Después de implementar esta corrección:
- ✅ El desglose de IVA se guarda en la base de datos
- ✅ El PDF muestra el desglose cuando está activo
- ✅ La vista en pantalla muestra el desglose
- ✅ Se puede editar cotizaciones con desglose
- ✅ Retrocompatible con cotizaciones antiguas

---

**Versión:** 1.0.0
**Fecha:** Noviembre 2025
**Desarrollado para:** Panel Admin Tintas y Tecnología
