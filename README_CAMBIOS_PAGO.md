# 💰 Campos de Pago - Módulo Taller

## 🎯 ¿Qué se agregó?

3 nuevos campos para manejar pagos en el módulo de Taller:

- **Valor del Servicio**: Costo total
- **Abono**: Pago inicial del cliente
- **Total a Pagar**: Saldo pendiente (calculado automáticamente)

## 📦 ¿Dónde aparecen?

✅ Formulario de registro
✅ Lista de servicios
✅ Detalle del servicio
✅ **PDF del comprobante** ← Lo más importante

## 🚀 Instalación Rápida

### 1. SQL en Supabase (2 min)
```
Archivo: SQL_AGREGAR_CAMPOS_PAGO_TALLER.sql
Ejecutar en: https://cxxifwpwarbrrodtzyqn.supabase.co → SQL Editor
```

### 2. Subir a GitHub (3 min)
```
Subir carpeta: app/taller/ completa
Commit: "feat: agregar campos de pago al módulo taller"
```

### 3. Deploy Automático en Vercel (2-3 min)
```
Esperar deploy automático
```

### 4. Probar (5 min)
```
1. Registrar servicio con:
   - Valor: $50,000
   - Abono: $20,000
2. Descargar PDF
3. Verificar que aparece: "SALDO PENDIENTE: $30,000"
```

## 📊 Ejemplo en el PDF

```
╔═══════════════════════════════════════╗
║   💰 INFORMACIÓN DE PAGO              ║
╠═══════════════════════════════════════╣
║ Valor del servicio: $50,000          ║
║ Abono realizado: $20,000              ║
║                                       ║
║ ┌───────────────────────────────────┐ ║
║ │ SALDO PENDIENTE: $30,000          │ ║  (Fondo rojo)
║ └───────────────────────────────────┘ ║
╚═══════════════════════════════════════╝

Si está pagado completamente:
┌───────────────────────────────────┐
│ ✓ PAGADO COMPLETAMENTE            │  (Fondo verde)
└───────────────────────────────────┘
```

## ✨ Características

- ✅ Cálculo automático del saldo
- ✅ Validación: abono ≤ valor
- ✅ Formato de moneda colombiana
- ✅ Colores visuales (rojo/verde)
- ✅ Se oculta si valor = $0

## 📁 Archivos

```
taller-mejoras-pago/
├── SQL_AGREGAR_CAMPOS_PAGO_TALLER.sql
├── INSTRUCCIONES_COMPLETAS.md (detallado)
├── README_CAMBIOS_PAGO.md (este archivo)
└── app/taller/
    ├── layout.js
    ├── page.js
    ├── nuevo/page.js
    └── [id]/page.js
```

## 💡 Tips

1. **El total se calcula solo** - No lo edites manualmente
2. **Es opcional** - Puedes dejar en $0 si no cobras
3. **No afecta otros módulos** - Solo el Taller cambia
4. **Compatible con servicios antiguos** - Los sin valor siguen funcionando

## 🆘 Problemas Comunes

**"No veo la sección de pago en el PDF"**
→ Normal si el valor es $0. Registra un servicio con valor > 0.

**"El total no se actualiza"**
→ Es campo calculado en Supabase, se actualiza automáticamente al guardar.

**"Error en SQL"**
→ Verifica que copiaste TODO el contenido del archivo SQL.

## ⏱️ Tiempos

- Instalación: 10-15 minutos
- Primer uso: 2 minutos
- Generar PDF: 5-10 segundos

---

**Para instrucciones detalladas:** Lee `INSTRUCCIONES_COMPLETAS.md`

**Versión:** 1.0
**Fecha:** 13 Noviembre 2025
