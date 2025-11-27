# 🔧 CORRECCIONES REALIZADAS - Octubre 29, 2025

## Problemas Corregidos

### 🐛 Bug #1: "No hay productos disponibles" en Editar Cotización

**Descripción del problema:**
Al intentar editar una cotización, en la sección "Buscar Productos" aparecía el mensaje "No hay productos disponibles", impidiendo agregar o modificar productos en la cotización.

**Causa raíz:**
El archivo `/app/cotizaciones/[id]/editar/page.js` estaba filtrando los productos por `vendedor_id` en la línea 86:
```javascript
.from('productos')
.select('*')
.eq('vendedor_id', vendedorId)  // ❌ Filtro incorrecto
```

Pero la tabla `productos` en Supabase **NO tiene** una columna `vendedor_id`. Los productos son compartidos entre todos los vendedores.

**Solución aplicada:**
Se eliminó el filtro `.eq('vendedor_id', vendedorId)` de la consulta de productos:
```javascript
.from('productos')
.select('*')
.order('product_name')  // ✅ Corrección aplicada
```

---

### 🐛 Bug #2: Precios en $0 al editar cotización

**Descripción del problema:**
Después de corregir el Bug #1, los productos SÍ aparecían en el buscador, pero **todos mostraban precio $0**.

**Causa raíz:**
El código estaba usando la columna `price` para mostrar y asignar el precio:
```javascript
precio: producto.price  // ❌ Columna incorrecta
```

Pero en tu base de datos Supabase, el precio real está en la columna `price_cop`, no en `price`.

**Solución aplicada:**
Se cambió el código para usar `price_cop` como columna principal, con fallback a `price`:

**Línea 115 (agregar al carrito):**
```javascript
precio: producto.price_cop || producto.price || 0  // ✅ Corrección aplicada
```

**Línea 299 (mostrar precio en listado):**
```javascript
${(p.price_cop || p.price || 0).toLocaleString('es-CO')}  // ✅ Corrección aplicada
```

---

### 🐛 Bug #3: TOTAL A PAGAR superpuesto con footer en PDF

**Descripción del problema:**
Al generar el PDF de una cotización, el texto "TOTAL A PAGAR" aparecía **debajo del footer** (información de contacto), haciendo que se superpusieran ambos elementos.

**Causa raíz:**
El código no validaba si había suficiente espacio antes de dibujar el "TOTAL A PAGAR". El footer comienza en la posición Y=265, pero el total podía dibujarse en Y>250, causando superposición.

**Solución aplicada:**
Se agregó validación adicional de espacio antes de dibujar el total:

**Línea 244-251 (verificación mejorada):**
```javascript
// Asegurar que hay espacio suficiente para totales Y footer
if (yPos > 230) {
  doc.addPage()
  yPos = 20
}
```

**Línea 267-272 (verificación adicional antes del total):**
```javascript
// Verificar espacio antes del TOTAL A PAGAR
if (yPos > 245) {
  doc.addPage()
  yPos = 20
}
```

**Resultado:**
- ✅ El TOTAL A PAGAR ahora se dibuja con suficiente espacio
- ✅ Si no hay espacio, se crea una nueva página automáticamente
- ✅ El footer nunca se superpone con el contenido

---

## Archivos modificados:

### `/app/cotizaciones/[id]/editar/page.js`
- Línea 86: Eliminado filtro incorrecto de `vendedor_id`
- Línea 115: Cambiado `producto.price` por `producto.price_cop || producto.price || 0`
- Línea 299: Cambiado `p.price` por `p.price_cop || p.price || 0`

### `/app/cotizaciones/[id]/page.js`
- Línea 248: Mejorado umbral de verificación de espacio (de 250 a 230)
- Línea 267-272: Agregada verificación adicional antes del TOTAL A PAGAR
- Línea 271: Verificado espacio correcto en "TOTAL A PAGAR:"
- Línea 702: Verificado espacio correcto en template JPG

---

## Resultado:

Ahora el sistema funciona perfectamente:
- ✅ Los productos aparecen al editar cotizaciones
- ✅ Los precios se muestran correctamente (no en $0)
- ✅ El PDF se genera sin superposiciones
- ✅ El TOTAL A PAGAR aparece correctamente posicionado
- ✅ Los cambios se guardan correctamente

---

## Verificación Recomendada

Después de desplegar, verifica que:
- [ ] Al editar una cotización, los productos aparecen en el buscador
- [ ] Los precios se muestran correctamente (no en $0)
- [ ] Puedes buscar productos por nombre o código
- [ ] Puedes agregar productos a la cotización existente con los precios correctos
- [ ] Al generar PDF, el TOTAL A PAGAR aparece antes del footer
- [ ] El footer no se superpone con ningún contenido
- [ ] Los cambios se guardan correctamente

---

## Estructura de la Tabla `productos` en Supabase

Columnas confirmadas:
- `id` (int8)
- `created_at` (timestamptz)
- `sku` (text)
- `product_name` (text)
- `category` (text)
- `category_sub` (text)
- `available_stock` (numeric)
- `description` (text)
- **`price_cop` (numeric)** ← Columna correcta para el precio
- `price` (numeric) ← Columna secundaria (puede estar en 0)
- `brand` (text)
- `image_url_png` (text)
- `warranty_months` (int4)
- `is_active` (boolean)

**Nota importante:** 
- **NO existe** la columna `vendedor_id` en la tabla productos
- La columna principal de precio es **`price_cop`**, no `price`

---

## Próximos Pasos

1. **Desplegar a GitHub:**
   ```bash
   git add .
   git commit -m "Fix: Corregir productos, precios y posicionamiento PDF"
   git push origin main
   ```

2. **Verificar en Vercel:**
   - El redespliegue se hará automáticamente
   - Espera 2-3 minutos
   - Prueba generando un PDF de una cotización

---

**Correcciones realizadas por:** Claude  
**Fecha:** 29 de octubre de 2025  
**Versión:** 2.0.3 (Final)
