# 💰 AGREGAR CAMPOS DE PAGO AL MÓDULO TALLER

## 📋 RESUMEN

Se agregan 3 campos al módulo de Taller para manejar pagos:
- **Valor del Servicio**: Costo total del servicio
- **Abono**: Cantidad que el cliente pagó al dejar el equipo
- **Total a Pagar**: Saldo pendiente (se calcula automáticamente)

Estos campos aparecen en:
✅ Formulario de registro de servicio
✅ Lista de servicios
✅ Detalle del servicio
✅ **PDF del comprobante** (lo más importante)

---

## 🚀 PASOS DE INSTALACIÓN

### PASO 1: Ejecutar SQL en Supabase (2 minutos)

1. Ve a tu Supabase: https://cxxifwpwarbrrodtzyqn.supabase.co
2. Navega a: **SQL Editor**
3. Abre el archivo: `SQL_AGREGAR_CAMPOS_PAGO_TALLER.sql`
4. Copia TODO el contenido
5. Pega en el SQL Editor
6. Click en **RUN** (o presiona F5)
7. Verifica que veas: ✅ "Success" y 3 filas en los resultados

**¿Qué hace este SQL?**
- Agrega columna `valor_servicio` (DECIMAL)
- Agrega columna `abono` (DECIMAL)
- Agrega columna `total_pagar` (CALCULADA AUTOMÁTICAMENTE como valor_servicio - abono)

---

### PASO 2: Subir Archivos a GitHub (3 minutos)

Tienes 2 opciones:

#### Opción A - Subir todo junto (Recomendado)

1. Ve a tu repositorio en GitHub
2. Navega a la carpeta `app/`
3. Si ya existe la carpeta `taller/`, **elimínala**
4. Arrastra la carpeta completa `app/taller/` desde este ZIP
5. Commit: "feat: agregar campos de pago al módulo taller"
6. Push

#### Opción B - Subir archivo por archivo

Si prefieres verificar cada archivo:

1. Sube `app/taller/layout.js`
2. Sube `app/taller/page.js`
3. Sube `app/taller/nuevo/page.js`
4. Sube `app/taller/[id]/page.js`

---

### PASO 3: Vercel Deploy Automático (2-3 minutos)

1. Ve a: https://vercel.com/tintasytecnologias-projects
2. Busca tu proyecto: `panel-admin`
3. Vercel detectará los cambios automáticamente
4. Espera 2-3 minutos mientras se despliega
5. Verás el deploy completado con ✓

---

### PASO 4: Verificar que Funciona (5 minutos)

1. **Abrir el panel admin**
   - Login con tu usuario

2. **Ir al módulo Taller**
   - Click en "🛠️ Taller" en el sidebar

3. **Registrar un servicio de prueba**
   - Click en "+ Nuevo Servicio"
   - Llena los datos del cliente y equipo
   - **IMPORTANTE:** En "Información de Pago":
     - Valor del servicio: $50,000
     - Abono: $20,000
     - Verás que "Total a Pagar" se calcula automáticamente: $30,000
   - Guarda el servicio

4. **Verificar el PDF**
   - Abre el servicio que acabas de crear
   - Click en "📄 Descargar PDF"
   - **Verifica que el PDF contenga:**
     - ✅ Sección "💰 INFORMACIÓN DE PAGO"
     - ✅ Valor del servicio: $50,000
     - ✅ Abono realizado: $20,000
     - ✅ SALDO PENDIENTE: $30,000 (en rojo si hay saldo, verde si está pagado)

5. **Verificar en la lista**
   - Vuelve a la lista de servicios
   - Verás una tarjeta con la info de pago en gris

---

## 📊 DETALLES DE LOS CAMBIOS

### 1. Tabla en Supabase

```sql
-- Nueva estructura:
taller
  ├── ... (campos existentes)
  ├── valor_servicio DECIMAL(10,2)  -- Nuevo
  ├── abono DECIMAL(10,2)            -- Nuevo
  └── total_pagar DECIMAL(10,2)      -- Nuevo (calculado automáticamente)
```

### 2. Formulario de Registro (nuevo/page.js)

**Nuevo en el formulario:**
- Campo "Valor del Servicio" con formato de moneda
- Campo "Abono" con formato de moneda
- Muestra "Total a Pagar" calculado en tiempo real
- Validación: el abono no puede ser mayor al valor
- Visual en rojo si hay saldo, verde si está pagado

### 3. Lista de Servicios (page.js)

**Nuevo en la lista:**
- Tarjeta gris con 3 columnas: Valor | Abono | Saldo
- Saldo en rojo si hay pendiente, verde si está pagado
- Solo se muestra si el valor_servicio > 0

### 4. Detalle del Servicio ([id]/page.js)

**Nuevo en el detalle:**
- Sección completa "💰 Información de Pago"
- 3 tarjetas grandes con los valores
- Alerta amarilla si hay saldo pendiente
- Alerta verde si está pagado completamente

### 5. PDF del Comprobante

**LO MÁS IMPORTANTE - Nuevo en el PDF:**

El PDF ahora tiene una sección completa de pago:

```
┌─────────────────────────────────────┐
│   💰 INFORMACIÓN DE PAGO            │
├─────────────────────────────────────┤
│ Valor del servicio: $50,000        │
│ Abono realizado: $20,000           │
│                                     │
│ ╔═══════════════════════════════╗  │
│ ║ SALDO PENDIENTE: $30,000      ║  │
│ ╚═══════════════════════════════╝  │
└─────────────────────────────────────┘
```

- Si hay saldo pendiente: fondo rojo claro, texto rojo
- Si está pagado: fondo verde claro, texto verde "✓ PAGADO COMPLETAMENTE"

---

## 💡 EJEMPLOS DE USO

### Caso 1: Servicio con abono parcial

```
Valor del servicio: $80,000
Abono: $30,000
Total a pagar: $50,000
```

**En el PDF aparecerá:**
- Valor del servicio: $80,000
- Abono realizado: $30,000
- SALDO PENDIENTE: $50,000 (en fondo rojo)

### Caso 2: Servicio pagado completamente

```
Valor del servicio: $45,000
Abono: $45,000
Total a pagar: $0
```

**En el PDF aparecerá:**
- Valor del servicio: $45,000
- Abono realizado: $45,000
- ✓ PAGADO COMPLETAMENTE (en fondo verde)

### Caso 3: Servicio sin costo

```
Valor del servicio: $0
Abono: $0
Total a pagar: $0
```

**En el PDF NO aparecerá la sección de pago** (se oculta automáticamente)

---

## 🎯 FUNCIONALIDADES IMPORTANTES

### Cálculo Automático

El campo `total_pagar` se calcula **automáticamente** en la base de datos:
- No necesitas actualizarlo manualmente
- Siempre estará correcto: `valor_servicio - abono`
- Si cambias el valor o el abono, el total se recalcula solo

### Validaciones

- ✅ El abono no puede ser mayor al valor del servicio
- ✅ Los valores deben ser números positivos
- ✅ Los valores se guardan con 2 decimales
- ✅ El total se muestra en formato de moneda colombiana

### Formato de Moneda

Todos los valores se muestran en formato colombiano:
- $0 → Sin decimales
- $50,000 → Con separador de miles
- $1,234,567 → Formato completo COP

---

## 🔧 CONFIGURACIÓN ADICIONAL

### Si quieres cambiar los valores por defecto

Edita el archivo `SQL_AGREGAR_CAMPOS_PAGO_TALLER.sql` antes de ejecutarlo:

```sql
-- Cambiar valor por defecto (actualmente 0)
ADD COLUMN IF NOT EXISTS valor_servicio DECIMAL(10,2) DEFAULT 0;
```

Puedes cambiarlo a cualquier valor que quieras como predeterminado.

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Problema: "Column already exists"

**Causa:** Ya ejecutaste el SQL antes

**Solución:** No hay problema, el SQL usa `IF NOT EXISTS` y no dará error. Solo ignóralo.

### Problema: No aparece la sección de pago en el PDF

**Causa:** El valor_servicio es 0

**Solución:** Es normal. La sección solo aparece si el valor_servicio > 0. Registra un servicio con valor para verla.

### Problema: El total a pagar no se calcula

**Causa:** El campo es calculado automáticamente por PostgreSQL

**Solución:** 
1. Verifica que ejecutaste el SQL correctamente
2. El campo `total_pagar` es GENERATED ALWAYS, no se puede editar manualmente
3. Supabase lo calcula cuando guardas valor_servicio o abono

### Problema: Error al generar PDF

**Causa:** Puede ser problema con las fotos o conexión

**Solución:**
1. Verifica tu conexión a internet
2. Si falla, intenta de nuevo
3. El PDF se genera aunque algunas fotos no carguen

---

## 📝 NOTAS IMPORTANTES

1. **Backward Compatible:** Los servicios antiguos sin valor seguirán funcionando perfectamente. La sección de pago solo aparece si hay un valor.

2. **No afecta otros módulos:** Este cambio SOLO afecta al módulo de Taller. Clientes, Cotizaciones, Domicilios, etc. siguen igual.

3. **Los campos son opcionales:** Puedes registrar un servicio sin poner valor y abono (quedarán en 0).

4. **El PDF se genera en 2 páginas:**
   - Página 1: Comprobante (con info de pago si aplica)
   - Página 2: Evidencias fotográficas (solo si hay fotos)

---

## 📦 ARCHIVOS INCLUIDOS EN ESTE ZIP

```
taller-mejoras-pago/
│
├── SQL_AGREGAR_CAMPOS_PAGO_TALLER.sql  ← Ejecutar en Supabase
│
├── INSTRUCCIONES_COMPLETAS.md          ← Este archivo
├── README_CAMBIOS_PAGO.md              ← Resumen rápido
│
└── app/taller/                         ← Subir a GitHub
    ├── layout.js
    ├── page.js                         ← Lista con info de pago
    ├── nuevo/
    │   └── page.js                     ← Formulario con campos de pago
    └── [id]/
        └── page.js                     ← Detalle y PDF con pago
```

---

## ✅ CHECKLIST FINAL

Marca cada paso cuando lo completes:

- [ ] SQL ejecutado en Supabase
- [ ] Verificado que las 3 columnas se crearon
- [ ] Archivos subidos a GitHub
- [ ] Deploy completado en Vercel
- [ ] Probado registrar servicio con valores
- [ ] Verificado que el total se calcula bien
- [ ] Generado PDF y verificado que aparece la sección de pago
- [ ] Verificado colores (rojo si hay saldo, verde si está pagado)

---

## 🎉 ¡LISTO!

Ahora tu módulo de Taller tiene control completo de pagos:
- Registra el valor del servicio al ingresar el equipo
- Registra el abono que el cliente pagó
- El sistema calcula automáticamente cuánto debe
- El PDF muestra claramente la información de pago al cliente

**Tiempo total de instalación:** 10-15 minutos

**Si tienes dudas:** Revisa la sección "Solución de Problemas" o contacta soporte.

---

**Versión:** 1.0 - Campos de Pago para Taller
**Fecha:** 13 Noviembre 2025
**Compatibilidad:** Panel Admin v2.2.0+
