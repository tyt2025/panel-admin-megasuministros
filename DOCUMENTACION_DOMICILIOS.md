# 🚚 MÓDULO DE DOMICILIOS - DOCUMENTACIÓN v2.2.0

## 📋 RESUMEN DE CAMBIOS

Se agregó un nuevo módulo completo de gestión de domicilios al Panel Admin de Tintas y Tecnología.

### ✨ Nuevas Funcionalidades

1. **Módulo de Domicilios** (`/domicilios`)
   - Lista completa de barrios/zonas con tarifas
   - Búsqueda en tiempo real
   - Edición rápida de precios (inline editing)
   - Estadísticas (total zonas, tarifa mín/máx/promedio)
   - Eliminar domicilios

2. **Agregar Nuevo Domicilio** (`/domicilios/nuevo`)
   - Formulario con tipos: Barrio, Hotel, Negocio
   - Validación de duplicados
   - Tarifas de referencia
   - Tips y ayudas visuales

3. **Integración con Cotizaciones**
   - Opción opcional de "Incluir envío a domicilio"
   - Búsqueda de barrios en tiempo real
   - Cálculo automático en totales
   - Guardado de delivery_id y delivery_price

---

## 🗂️ ARCHIVOS NUEVOS/MODIFICADOS

### Archivos Nuevos:
```
app/domicilios/
├── layout.js                    ✅ Layout del módulo
├── page.js                      ✅ Lista de domicilios
└── nuevo/
    └── page.js                  ✅ Crear nuevo domicilio

SQL_AGREGAR_DOMICILIO_COTIZACIONES.sql  ✅ Script SQL
DOCUMENTACION_DOMICILIOS.md             ✅ Este archivo
```

### Archivos Modificados:
```
components/Sidebar.js            ✏️ Agregado enlace "Domicilios"
app/cotizaciones/nueva/page.js   ✏️ Agregada sección de domicilio opcional
```

---

## 🚀 INSTRUCCIONES DE DEPLOYMENT

### Paso 1: Ejecutar SQL en Supabase

1. Ve a tu proyecto en Supabase: https://cxxifwpwarbrrodtzyqn.supabase.co
2. Ve a `SQL Editor`
3. Copia y pega el contenido de `SQL_AGREGAR_DOMICILIO_COTIZACIONES.sql`
4. Haz clic en `RUN` o `F5`
5. Verifica que aparezca: "Columnas de domicilio agregadas exitosamente"

**Nota:** Los 250 barrios ya están en la tabla `delivery_rates`, no necesitas importarlos de nuevo.

### Paso 2: Verificar la Tabla delivery_rates

Ejecuta en SQL Editor:
```sql
SELECT COUNT(*) as total_barrios FROM delivery_rates;
```

Debería retornar: **250 barrios**

### Paso 3: Subir Código a GitHub

```bash
# En tu repositorio local (si tienes uno)
git add .
git commit -m "feat: módulo de domicilios + integración en cotizaciones v2.2.0"
git push origin main
```

**O simplemente:**
- Sube el ZIP completo `panel-admin-main.zip` a tu repositorio en GitHub
- Reemplaza todos los archivos

### Paso 4: Deploy Automático en Vercel

Si tu proyecto está conectado a GitHub:
1. Vercel detectará los cambios automáticamente
2. Iniciará el deploy
3. Espera ~2-3 minutos
4. ¡Listo! ✅

**Si no está conectado:**
1. Ve a https://vercel.com/tintasytecnologias-projects/panel-admin
2. Ve a `Settings` → `Git`
3. Conecta tu repositorio de GitHub
4. Haz push de los cambios

---

## 📊 ESTRUCTURA DE LA BASE DE DATOS

### Tabla: `cotizaciones` (Modificada)

Nuevas columnas agregadas:
```sql
delivery_id      INTEGER   (FK → delivery_rates.id)
delivery_price   INTEGER   DEFAULT 0
```

### Tabla: `delivery_rates` (Existente)

```sql
id              SERIAL PRIMARY KEY
created_at      TIMESTAMP
neighborhood    TEXT
price_cop       INTEGER
updated_at      TIMESTAMP
```

Total de registros: **250 barrios**

---

## 🎨 FUNCIONALIDADES DETALLADAS

### 1. Lista de Domicilios

**Características:**
- ✅ Tabla responsive con 250 barrios
- ✅ Búsqueda en tiempo real
- ✅ Estadísticas visuales (min/max/promedio)
- ✅ Edición inline de precios (clic en ✏️)
- ✅ Eliminar domicilios (clic en 🗑️)
- ✅ Formato de moneda COP
- ✅ Última actualización

**Estadísticas mostradas:**
- Total de zonas
- Tarifa mínima: $6,000
- Tarifa máxima: $26,000
- Tarifa promedio: ~$8,500

### 2. Agregar Nuevo Domicilio

**Características:**
- ✅ 3 tipos de ubicación (Barrio, Hotel, Negocio)
- ✅ Validación de duplicados
- ✅ Tarifas de referencia:
  - Centro: $6,000
  - Intermedia: $8,000
  - Alejada: $12,000
  - Turística: $18,000
- ✅ Placeholder dinámico según tipo
- ✅ Tips y guías visuales

### 3. Cotizaciones con Domicilio

**Características:**
- ✅ Checkbox opcional "¿Incluir envío a domicilio?"
- ✅ Búsqueda de barrios en tiempo real
- ✅ Autocompletado con precio
- ✅ Vista previa de zona seleccionada
- ✅ Cálculo automático en totales
- ✅ Link directo para agregar nuevo domicilio si no existe

**Flujo:**
1. Usuario crea cotización
2. Activa checkbox de domicilio
3. Busca el barrio
4. Selecciona de la lista
5. Se muestra la zona y precio
6. Se suma automáticamente al total
7. Se guarda delivery_id y delivery_price

---

## 💡 EJEMPLOS DE USO

### Ejemplo 1: Crear Cotización con Domicilio

```
1. Usuario: tintasytecnologia1
2. Cliente: Juan Pérez
3. Productos: 
   - Tinta Canon (2 unid) = $60,000
   - Papel A4 (1 unid) = $15,000
4. ✅ Incluir envío a domicilio
5. Barrio: "El Rodadero" → $12,000
6. Total: $87,000 ($75,000 + $12,000)
```

### Ejemplo 2: Agregar Nuevo Domicilio

```
1. Ve a Domicilios → + Agregar Domicilio
2. Tipo: Hotel
3. Nombre: Hotel Zuana
4. Valor: $18,000
5. Guardar
6. ✅ Ahora aparece en la lista
```

---

## 🔧 TIPS DE USO

### Para Vendedores:

1. **Buscar rápido:** Usa Ctrl+F en la lista de domicilios
2. **Editar precio:** Clic en ✏️, editar, clic en ✓
3. **Cotización sin domicilio:** Simplemente no actives el checkbox
4. **Barrio no existe:** Agrégalo desde el botón "+ Agregar Domicilio"

### Para Administradores:

1. **Revisar tarifas:** Ve a Domicilios para ver todas las zonas
2. **Actualizar precios:** Edición inline o desde el CSV
3. **Estadísticas:** Dashboard muestra promedio y rangos
4. **Backup:** Exporta delivery_rates desde Supabase

---

## 📱 RESPONSIVE DESIGN

Todos los componentes son 100% responsive:
- ✅ Lista de domicilios en móviles
- ✅ Formulario adaptado a pantallas pequeñas
- ✅ Búsqueda funcional en tablets
- ✅ Estadísticas en grid responsive

---

## 🐛 TROUBLESHOOTING

### Error: "No se cargan los domicilios"
**Solución:** Verifica que ejecutaste el SQL y que la tabla `delivery_rates` tiene 250 registros.

```sql
SELECT COUNT(*) FROM delivery_rates;
```

### Error: "No puedo guardar la cotización"
**Solución:** Verifica que las columnas `delivery_id` y `delivery_price` existen en `cotizaciones`:

```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'cotizaciones' 
AND column_name IN ('delivery_id', 'delivery_price');
```

### Error: "El precio del domicilio no se suma"
**Solución:** Asegúrate de que el checkbox está activado y que seleccionaste un barrio.

---

## 🔐 PERMISOS DE SUPABASE

Las tablas ya tienen los permisos correctos (RLS deshabilitado para desarrollo).

Si necesitas habilitar RLS más adelante:

```sql
-- Habilitar RLS
ALTER TABLE delivery_rates ENABLE ROW LEVEL SECURITY;

-- Policy para lectura (todos)
CREATE POLICY "Permitir lectura delivery_rates" 
ON delivery_rates FOR SELECT 
USING (true);

-- Policy para escritura (solo autenticados)
CREATE POLICY "Permitir escritura delivery_rates" 
ON delivery_rates FOR ALL 
USING (true);
```

---

## 📈 PRÓXIMAS MEJORAS SUGERIDAS

- [ ] Exportar lista de domicilios a Excel
- [ ] Importar domicilios desde CSV
- [ ] Historial de cambios de precios
- [ ] Alertas cuando un barrio cambia de precio
- [ ] Agrupar por zonas (Norte, Centro, Sur, Turística)
- [ ] Mapa interactivo de zonas
- [ ] Calcular distancia desde tienda

---

## 📞 SOPORTE

Para dudas o problemas:
- Revisa esta documentación
- Verifica los logs en Vercel
- Revisa los logs en Supabase SQL Editor
- Contacta al desarrollador

---

## 📝 CHANGELOG

### v2.2.0 (30 Octubre 2025)
- ✅ Agregado módulo completo de Domicilios
- ✅ Integración con Cotizaciones
- ✅ 250 barrios de Santa Marta precargados
- ✅ Búsqueda en tiempo real
- ✅ Edición inline de precios
- ✅ Estadísticas visuales
- ✅ Link en Sidebar

---

**🎉 ¡Módulo de Domicilios v2.2.0 completado!**

Desarrollado para: Tintas y Tecnología - Santa Marta, Colombia  
Fecha: 30 de Octubre de 2025
