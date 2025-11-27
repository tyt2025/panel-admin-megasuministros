# 📋 INSTRUCCIONES SQL PARA SUPABASE

## 🎯 OBJETIVO
Agregar soporte para domicilios en el módulo de cotizaciones.

---

## ⚠️ IMPORTANTE
- La tabla `delivery_rates` ya existe con 250 barrios
- Solo necesitas agregar 2 columnas a la tabla `cotizaciones`
- Este proceso es SEGURO y no afecta datos existentes

---

## 📝 PASO A PASO

### 1. Conectarse a Supabase

1. Ve a: https://supabase.com
2. Inicia sesión
3. Selecciona tu proyecto: **cxxifwpwarbrrodtzyqn**
4. Ve a la sección **SQL Editor** (icono de terminal)

### 2. Ejecutar el SQL

Copia y pega el siguiente código en el editor:

```sql
-- =============================================
-- AGREGAR CAMPOS DE DOMICILIO A COTIZACIONES
-- =============================================

-- Agregar columnas de domicilio a la tabla cotizaciones
ALTER TABLE cotizaciones
ADD COLUMN IF NOT EXISTS delivery_id INTEGER REFERENCES delivery_rates(id),
ADD COLUMN IF NOT EXISTS delivery_price INTEGER DEFAULT 0;

-- Agregar índice para mejor performance
CREATE INDEX IF NOT EXISTS idx_cotizaciones_delivery_id ON cotizaciones(delivery_id);

-- Verificar las columnas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'cotizaciones'
AND column_name IN ('delivery_id', 'delivery_price');

-- Mensaje de confirmación
SELECT 'Columnas de domicilio agregadas exitosamente a cotizaciones' AS status;
```

### 3. Ejecutar

- Haz clic en el botón **RUN** (o presiona F5)
- Espera 1-2 segundos

### 4. Verificar Resultado

Deberías ver en los resultados:

**Primera consulta:**
```
column_name      | data_type | is_nullable
-----------------+-----------+-------------
delivery_id      | integer   | YES
delivery_price   | integer   | YES
```

**Segunda consulta:**
```
status
-------------------------------------------
Columnas de domicilio agregadas exitosamente a cotizaciones
```

---

## ✅ VERIFICACIÓN ADICIONAL (Opcional)

Si quieres asegurarte que todo está bien, ejecuta:

```sql
-- Ver estructura completa de cotizaciones
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'cotizaciones'
ORDER BY ordinal_position;
```

Deberías ver las nuevas columnas:
- `delivery_id` - tipo: integer
- `delivery_price` - tipo: integer, default: 0

---

## 📊 VERIFICAR BARRIOS (Opcional)

Para confirmar que tienes los 250 barrios:

```sql
-- Contar barrios
SELECT COUNT(*) as total_barrios FROM delivery_rates;

-- Ver algunos barrios
SELECT id, neighborhood, price_cop 
FROM delivery_rates 
ORDER BY price_cop 
LIMIT 10;

-- Ver estadísticas de tarifas
SELECT 
  COUNT(*) as total_zonas,
  MIN(price_cop) as tarifa_minima,
  MAX(price_cop) as tarifa_maxima,
  ROUND(AVG(price_cop)) as tarifa_promedio
FROM delivery_rates;
```

Resultado esperado:
```
total_zonas: 250
tarifa_minima: 6000
tarifa_maxima: 26000
tarifa_promedio: ~8500
```

---

## 🔄 SI ALGO SALE MAL

### Error: "column already exists"
✅ **No hay problema.** Significa que ya ejecutaste el SQL antes. Las columnas ya existen.

### Error: "relation delivery_rates does not exist"
❌ **Problema:** La tabla delivery_rates no existe.

**Solución:**
1. Ve a **Table Editor**
2. Busca la tabla `delivery_rates`
3. Si no existe, debes importar el CSV: `delivery_rates_rows.csv`

**Para importar CSV:**
1. Table Editor → Create Table → "delivery_rates"
2. Columnas:
   - `id` (int8, primary key)
   - `created_at` (timestamp)
   - `neighborhood` (text)
   - `price_cop` (int8)
   - `updated_at` (timestamp)
3. Importa el CSV desde las opciones

### Error: Permission denied
❌ **Problema:** No tienes permisos de administrador.

**Solución:**
- Asegúrate de estar logueado con la cuenta dueña del proyecto
- O pide al administrador que ejecute el SQL

---

## 📝 NOTAS TÉCNICAS

### ¿Qué hace cada línea?

```sql
ALTER TABLE cotizaciones
ADD COLUMN IF NOT EXISTS delivery_id INTEGER REFERENCES delivery_rates(id)
```
→ Agrega columna `delivery_id` que apunta a un barrio específico

```sql
ADD COLUMN IF NOT EXISTS delivery_price INTEGER DEFAULT 0
```
→ Agrega columna `delivery_price` que guarda el valor del domicilio

```sql
CREATE INDEX IF NOT EXISTS idx_cotizaciones_delivery_id ON cotizaciones(delivery_id)
```
→ Crea un índice para búsquedas más rápidas

### ¿Es seguro?

✅ **SÍ**, porque:
- Usa `IF NOT EXISTS` (no duplica si ya existe)
- No borra datos existentes
- Solo agrega columnas nuevas
- Los valores default son NULL y 0

### ¿Afecta cotizaciones existentes?

✅ **NO afecta nada**
- Las cotizaciones existentes tendrán delivery_id = NULL
- delivery_price = 0
- Siguen funcionando normalmente
- Solo las nuevas cotizaciones usarán el domicilio

---

## 🎉 ¡LISTO!

Después de ejecutar el SQL exitosamente:
1. ✅ Las columnas están agregadas
2. ✅ Puedes cerrar el SQL Editor
3. ✅ Continúa con el deploy del código en Vercel

**No necesitas hacer nada más en Supabase.**

---

**Proyecto:** Panel Admin Tintas y Tecnología  
**Versión:** v2.2.0  
**Fecha:** 30 Octubre 2025
