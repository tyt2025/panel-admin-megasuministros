# 🏢 Panel Administrativo - Mega Suministros

Sistema completo de gestión administrativa para Mega Suministros en Santa Marta, Colombia.

## 📋 Características

### ✅ Módulos Principales
- 📝 **Cotizaciones** - Generación de cotizaciones con cálculo automático de IVA
- 👥 **Clientes** - Gestión de base de datos de clientes
- 📦 **Productos** - Inventario y catálogo de productos
- 🔧 **Garantías** - Registro y seguimiento de garantías
- ⚙️ **Taller** - Gestión de servicios de mantenimiento y reparación
- 🚚 **Domicilios** - Tarifas de envío por barrios de Santa Marta
- 📊 **Reportes** - Análisis y estadísticas del negocio

### 🎨 Diseño y UI
- Interfaz moderna y responsiva
- Optimizada para desktop y móvil
- Menú lateral colapsable
- Tema profesional con colores corporativos

## 🚀 Instalación y Configuración

### Paso 1: Configurar Base de Datos en Supabase

1. Ve a [Supabase](https://fmxxoitoyrayhlibfaty.supabase.co)
2. Navega a **SQL Editor**
3. Ejecuta el archivo: `MEGA_SUMINISTROS_SETUP_COMPLETO.sql`
4. Verifica que todas las tablas se crearon correctamente

### Paso 2: Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
NEXT_PUBLIC_SUPABASE_URL=https://fmxxoitoyrayhlibfaty.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZteHhvaXRveXJheWhsaWJmYXR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MjIzMjQsImV4cCI6MjA3OTM5ODMyNH0.RxuV4dg5bIzCntL1vCyAhfo-pB5N5G1f48_dBgTN8tY
```

### Paso 3: Deploy en Vercel (Recomendado - No requiere instalación local)

#### Opción A: Conectar desde GitHub

1. Sube el proyecto a GitHub:
```bash
git init
git add .
git commit -m "Initial commit - Mega Suministros"
git branch -M main
git remote add origin [TU_REPO_URL]
git push -u origin main
```

2. Ve a [Vercel](https://vercel.com)
3. Clic en **"New Project"**
4. Importa tu repositorio de GitHub
5. Configura las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Haz clic en **"Deploy"**
7. ¡Listo! Tu panel estará disponible en unos minutos

## 🔑 Credenciales de Acceso

### Usuarios Predeterminados

**Usuario 1:**
- Username: `megasuministros1`
- Password: `MegaSuministros2025!`

**Usuario 2:**
- Username: `megasuministros2`
- Password: `MegaSuministros2025!`

> ⚠️ **Importante:** Cambia estas contraseñas después del primer inicio de sesión desde el dashboard.

## 📍 Información del Negocio

**Mega Suministros**
- **Dirección:** Centro Comercial Ocean Mall, Av. Del Ferrocarril #15-100 Local S2
- **Ciudad:** Santa Marta, Magdalena
- **Horario:** 9:00 AM - 8:00 PM (Lunes a Domingo)
- **Eslogan:** Tecnología, Calidad y Economía

## 🗂️ Estructura del Proyecto

```
panel-admin-megasuministros/
├── app/
│   ├── clientes/          # Módulo de clientes
│   ├── cotizaciones/      # Módulo de cotizaciones
│   ├── dashboard/         # Panel principal
│   ├── domicilios/        # Módulo de domicilios
│   ├── garantias/         # Módulo de garantías
│   ├── login/             # Página de inicio de sesión
│   ├── productos/         # Módulo de productos
│   ├── reportes/          # Módulo de reportes
│   ├── taller/            # Módulo de taller
│   ├── globals.css        # Estilos globales
│   ├── layout.js          # Layout principal
│   └── page.js            # Página de inicio
├── components/
│   └── Sidebar.js         # Menú lateral
├── lib/
│   ├── supabase.js        # Cliente de Supabase
│   └── utils.js           # Utilidades
├── .env.example           # Ejemplo de variables de entorno
├── next.config.js         # Configuración de Next.js
├── package.json           # Dependencias del proyecto
└── README.md              # Este archivo
```

## 📊 Base de Datos

### Tablas Principales

1. **vendedores** - Información de vendedores
2. **usuarios_admin** - Usuarios del sistema con gestión de contraseñas
3. **clientes** - Base de datos de clientes
4. **productos** - Catálogo de productos
5. **cotizaciones** - Registro de cotizaciones
6. **delivery_rates** - Tarifas de domicilio
7. **garantias** - Registro de garantías
8. **garantias_fotos** - Fotos de evidencia de garantías
9. **taller** - Servicios de taller

## 🎯 Funcionalidades Principales

### Cotizaciones
- Crear nuevas cotizaciones
- Buscar y seleccionar clientes
- Agregar múltiples productos
- Cálculo automático de subtotal, IVA y total
- Opción de envío a domicilio
- Generar PDF de la cotización
- Enviar por WhatsApp

### Clientes
- Agregar nuevos clientes
- Editar información de clientes
- Buscar por nombre o NIT
- Ver historial de cotizaciones

### Productos
- Gestionar catálogo de productos
- Control de inventario (stock)
- Precios de venta y costo
- Imágenes de productos
- Búsqueda rápida

### Garantías
- Registrar garantías de productos
- Subir fotos de evidencia
- Seguimiento de estado
- Registro de accesorios entregados

### Taller
- Registrar servicios de mantenimiento y reparación
- Control de estado del servicio
- Registro de pagos
- Fotos de los equipos
- Notas del técnico

### Domicilios
- Gestión de tarifas por barrio
- Búsqueda de barrios en tiempo real
- Edición de precios
- Agregar nuevos barrios

### Gestión de Contraseñas
- Cambio de contraseña desde el dashboard
- Validación de contraseña actual
- Sistema seguro de actualización

## 🛠️ Tecnologías Utilizadas

- **Framework:** Next.js 14
- **Base de Datos:** Supabase (PostgreSQL)
- **UI:** React + Tailwind CSS
- **Generación de PDFs:** jsPDF + html2canvas
- **Despliegue:** Vercel

## 📱 Características Adicionales

### Responsive Design
El panel funciona perfectamente en:
- 💻 Desktop
- 📱 Tablets
- 📱 Móviles

### Generación de PDFs
- Cotizaciones con logo y datos del negocio
- Formato profesional
- Descarga directa

### Integración WhatsApp
- Enviar cotizaciones directamente
- Mensaje personalizado
- Enlace directo al cliente

## 🔒 Seguridad

- Row Level Security (RLS) habilitado en Supabase
- Autenticación basada en usuario y contraseña
- Sistema de cambio de contraseñas
- Políticas de acceso configuradas
- Validación de sesión en cada página

## 🆘 Soporte y Troubleshooting

### Problema: No puedo iniciar sesión
- Verifica que ejecutaste el SQL en Supabase
- Confirma que las variables de entorno están configuradas
- Usa las credenciales predeterminadas

### Problema: No se muestran los productos/clientes
- Verifica la conexión a Supabase
- Revisa que las tablas existan en la base de datos
- Verifica los logs en la consola del navegador

### Problema: Error al desplegar en Vercel
- Asegúrate de configurar las variables de entorno en Vercel
- Verifica que el repositorio esté actualizado
- Revisa los logs de deployment en Vercel

## 📄 Archivos Importantes

- `MEGA_SUMINISTROS_SETUP_COMPLETO.sql` - Script SQL completo para crear la base de datos
- `.env.example` - Ejemplo de variables de entorno
- `README.md` - Esta documentación

## 📈 Próximas Funcionalidades

- Dashboard con gráficas avanzadas
- Exportación de reportes a Excel
- Notificaciones por email
- Gestión de usuarios y permisos
- Inventario con alertas de stock bajo

---

**Versión:** 1.0.0  
**Fecha:** 22 de Noviembre 2025  
**Desarrollado para:** Mega Suministros - Santa Marta, Colombia

**Tecnología:** Next.js + Supabase + Vercel  
**Licencia:** Propietario - Todos los derechos reservados
