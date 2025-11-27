# 🚀 INSTRUCCIONES RÁPIDAS - Módulo de Taller

## 📦 Pasos para Instalar el Módulo de Taller

### 1️⃣ Crear la Tabla en Supabase

1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. Click en **SQL Editor** (menú lateral izquierdo)
3. Click en **+ New Query**
4. Copia y pega el contenido del archivo: `CREAR_TABLA_TALLER.sql`
5. Click en **Run** o presiona `Ctrl + Enter`
6. Verifica que aparezca: ✅ "Tabla TALLER creada exitosamente"

### 2️⃣ Configurar el Storage para Fotos

**Opción A: Usando SQL (Recomendado)**

1. En **SQL Editor**, crea una nueva query
2. Copia y pega el contenido de: `STORAGE_TALLER_SETUP.sql`
3. Click en **Run**

**Opción B: Manualmente en Dashboard**

1. Ve a **Storage** en el menú lateral
2. Click en **New bucket**
3. Nombre: `taller-fotos`
4. **Importante**: Marca como **PUBLIC**
5. Click en **Create bucket**
6. Luego ejecuta solo las políticas del archivo `STORAGE_TALLER_SETUP.sql`

### 3️⃣ Verificar Variables de Entorno

Las variables de entorno que ya tienes funcionan para este módulo:

```env
NEXT_PUBLIC_SUPABASE_URL=https://cxxifwpwarbrrodtzyqn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

✅ No necesitas agregar nada nuevo

### 4️⃣ Subir el Código a GitHub

```bash
# En tu terminal, dentro de la carpeta del proyecto
git add .
git commit -m "✨ Agregar módulo de Taller v2.1.0"
git push origin main
```

### 5️⃣ Desplegar en Vercel

1. Vercel detectará automáticamente el cambio en GitHub
2. Iniciará el deployment automáticamente
3. Espera 2-3 minutos
4. ¡Listo! ✅

### 6️⃣ Probar el Módulo

1. Abre tu aplicación
2. Inicia sesión
3. En el **Dashboard**, verás:
   - Nueva tarjeta de "Taller" con contador
   - Botón "🛠️ Registrar en Taller"
4. En el **menú lateral**, verás la opción "🛠️ Taller"
5. **Registra un servicio de prueba**:
   - Completa el formulario
   - Sube algunas fotos de prueba
   - Guarda el servicio
6. **Verifica que funcione**:
   - Ve a la lista de servicios
   - Abre el detalle del servicio
   - Cambia el estado
   - Verifica que las fotos se vean correctamente

---

## ✅ Checklist de Verificación

- [ ] Tabla `taller` creada en Supabase
- [ ] Bucket `taller-fotos` creado y configurado como PUBLIC
- [ ] Políticas de storage configuradas
- [ ] Código subido a GitHub
- [ ] Deployment exitoso en Vercel
- [ ] Dashboard muestra contador de taller
- [ ] Botón de taller funciona
- [ ] Menú lateral muestra opción de taller
- [ ] Puedes registrar un servicio
- [ ] Puedes subir fotos
- [ ] Puedes ver la lista de servicios
- [ ] Puedes ver el detalle de un servicio
- [ ] Puedes cambiar el estado
- [ ] Las fotos se ven correctamente

---

## 🐛 Solución de Problemas Comunes

### Error: "Table 'taller' does not exist"
**Solución**: Ejecuta el archivo `CREAR_TABLA_TALLER.sql` en Supabase

### Error al subir fotos
**Solución**: 
1. Verifica que el bucket `taller-fotos` exista
2. Confirma que esté marcado como PUBLIC
3. Ejecuta `STORAGE_TALLER_SETUP.sql` para las políticas

### No veo la opción de Taller en el menú
**Solución**: 
1. Haz un hard refresh (Ctrl + Shift + R)
2. Verifica que el código esté actualizado en GitHub
3. Confirma que Vercel haya terminado el deployment

### Las fotos no cargan
**Solución**:
1. Verifica que el bucket sea PUBLIC
2. Abre la consola del navegador (F12) y busca errores
3. Confirma que las URLs de las fotos sean accesibles

### El contador de taller muestra 0
**Solución**: 
1. Registra al menos un servicio
2. Recarga la página
3. Verifica en Supabase que el servicio se guardó

---

## 📞 Soporte

Si tienes problemas:
1. Revisa esta guía
2. Consulta `DOCUMENTACION_TALLER.md` para más detalles
3. Revisa los logs en la consola del navegador (F12)
4. Verifica los logs de Vercel en el dashboard

---

## 🎉 ¡Felicidades!

Has instalado exitosamente el módulo de Taller. Ahora puedes:
- ✅ Registrar servicios de mantenimiento, reparación y revisión
- ✅ Subir fotos de los equipos
- ✅ Gestionar estados de servicios
- ✅ Controlar productos abandonados según la ley

---

**Desarrollado con ❤️ para Tintas y Tecnología**

🛠️ **Módulo de Taller v1.0 - Octubre 2025**
