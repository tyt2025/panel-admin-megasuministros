# 🔍 DEBUGGING - PRODUCTOS NO APARECEN EN COTIZACIONES

## 📊 Diagnóstico del Problema

Luis reporta que los productos nuevos que agrega desde el dashboard NO aparecen en cotizaciones.

---

## ✅ MEJORAS APLICADAS EN ESTA VERSIÓN

### 1. **Búsqueda normalizada** (✅ Ya aplicado)
- Elimina acentos, mayúsculas y caracteres especiales
- "video balun" ahora encuentra "Vídeo Balún"

### 2. **Logging en consola** (✅ NUEVO)
- Abre DevTools (F12) → Console
- Verás mensajes como:
  ```
  📦 Productos cargados: 1019
  📦 Primeros 3 productos: [{id: 1, name: "...", sku: "..."}]
  📦 Últimos 3 productos: [{id: 1019, name: "...", sku: "..."}]
  ```

### 3. **Contador visible** (✅ NUEVO)
- En Nueva Cotización: "Buscar producto (X productos disponibles)"
- En Editar: "Buscar Productos (X disponibles)"

---

## 🧪 PASOS PARA DIAGNOSTICAR

### Paso 1: Verificar cuántos productos se cargan

1. Ve a **Cotizaciones → Nueva Cotización**
2. Mira el texto: "Buscar producto (X productos disponibles)"
3. Pregunta: ¿Cuántos productos muestra?
   - ✅ Si muestra ~1019: Los productos SÍ se cargan
   - ❌ Si muestra menos: Hay un problema de consulta

### Paso 2: Ver consola del navegador

1. Presiona **F12** para abrir DevTools
2. Ve a la pestaña **Console**
3. Recarga la página
4. Busca el mensaje: `📦 Productos cargados: X`
5. Verifica:
   - ¿Se muestran los últimos productos que agregaste?
   - ¿Los IDs son los correctos?

### Paso 3: Verificar en Supabase

1. Ve a Supabase → Table Editor → productos
2. Busca los productos que agregaste recientemente
3. Verifica:
   - ✅ `product_name` tiene valor (no NULL)
   - ✅ `is_active` = true
   - ✅ `price_cop` tiene valor
   - ✅ La imagen está en `productos-imgs` o `product-images`

---

## 🔧 POSIBLES PROBLEMAS Y SOLUCIONES

### Problema 1: Productos con product_name NULL

**Síntoma:** Algunos productos no aparecen en la búsqueda

**Causa:** Si `product_name` es NULL, el ordenamiento puede fallar

**Solución SQL:**
```sql
-- Ver productos sin nombre
SELECT id, sku, product_name 
FROM productos 
WHERE product_name IS NULL OR product_name = '';

-- Actualizar productos sin nombre
UPDATE productos 
SET product_name = sku 
WHERE product_name IS NULL OR product_name = '';
```

### Problema 2: Productos con is_active = false

**Síntoma:** Productos no aparecen aunque existan en la base de datos

**Causa:** El código NO filtra por is_active, PERO si agregas productos con is_active=false, podrían no verse en otros módulos

**Verificación SQL:**
```sql
SELECT COUNT(*) as total_productos FROM productos;
SELECT COUNT(*) as activos FROM productos WHERE is_active = true;
SELECT COUNT(*) as inactivos FROM productos WHERE is_active = false;
```

**Solución:** Asegúrate que los productos nuevos tengan `is_active = true`

### Problema 3: Problema de caché

**Síntoma:** Agregaste productos pero no aparecen

**Solución:**
1. Presiona `Ctrl + Shift + R` (recarga forzada)
2. O abre en modo incógnito: `Ctrl + Shift + N`

### Problema 4: Límite de la consulta

**Síntoma:** Solo aparecen los primeros 1000 productos

**Verificación:** En consola, verifica si `📦 Productos cargados:` muestra 1000 exactos

**Solución:** Si es así, hay un límite en Supabase. Agregar `.limit(10000)` en la consulta

---

## 📝 CÓDIGO ACTUAL DE CARGA

### En `app/cotizaciones/nueva/page.js` (línea 58-61):

```javascript
supabase
  .from('productos')
  .select('*')
  .order('product_name'),
```

**✅ Sin filtros** - Carga TODOS los productos  
**✅ Sin límite** - Carga todos sin restricción de cantidad

---

## 🎯 SIGUIENTE PASO SEGÚN EL DIAGNÓSTICO

### Si el contador muestra MENOS productos de los esperados:
→ El problema es en la consulta a Supabase
→ Verifica en Supabase cuántos productos realmente hay

### Si el contador muestra TODOS los productos:
→ El problema es en la búsqueda/filtrado
→ Prueba buscar por SKU exacto del producto nuevo

### Si los productos aparecen en consola pero NO en búsqueda:
→ Hay un problema con normalizeText o el filtro
→ Revisa que product_name no sea NULL

---

## 📞 INFORMACIÓN PARA REPORTAR

Si el problema persiste, reporta lo siguiente:

1. **Contador visible:** "X productos disponibles"
2. **Consola:** Captura del mensaje `📦 Productos cargados: X`
3. **Supabase:** Cuántos productos hay en total en la tabla
4. **Ejemplo:** SKU de un producto que NO aparece
5. **Búsqueda:** Qué texto buscaste

---

## 🔄 CÓMO REVERTIR ESTOS CAMBIOS

Si necesitas volver atrás:

1. Los console.log no afectan funcionalidad, solo muestran info
2. El contador tampoco afecta, solo muestra un número
3. Puedes comentar las líneas con `//` si quieres ocultarlos

---

**Última actualización:** 10 de Noviembre, 2025  
**Versión:** 2.1 - Con debugging
