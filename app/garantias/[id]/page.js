'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { jsPDF } from 'jspdf'

export default function DetalleGarantia() {
  const [garantia, setGarantia] = useState(null)
  const [fotos, setFotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [editandoEstado, setEditandoEstado] = useState(false)
  const [nuevoEstado, setNuevoEstado] = useState('')
  const [viendoFoto, setViendoFoto] = useState(null)
  const [autoPrintDone, setAutoPrintDone] = useState(false)
  const [generandoPDF, setGenerandoPDF] = useState(false)
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    loadGarantia()
  }, [params.id, router])

  const loadGarantia = async () => {
    try {
      const { data, error } = await supabase
        .from('garantias')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      setGarantia(data)
      setNuevoEstado(data.estado)

      // Cargar fotos de evidencia
      const { data: fotosData, error: fotosError } = await supabase
        .from('garantias_fotos')
        .select('*')
        .eq('garantia_id', params.id)
        .order('created_at', { ascending: true })

      if (fotosError) throw fotosError
      setFotos(fotosData || [])
    } catch (error) {
      console.error('Error loading garantia:', error)
      alert('Error al cargar garantía')
    } finally {
      setLoading(false)
    }
  }

  // Auto-generar PDF cuando viene del formulario nuevo
  useEffect(() => {
    const shouldPrint = searchParams.get('print') === 'true'
    if (garantia && !loading && shouldPrint && !autoPrintDone) {
      setAutoPrintDone(true)
      // Esperar un momento para que se renderice todo
      setTimeout(() => {
        generarPDF()
      }, 500)
    }
  }, [garantia, loading, searchParams, autoPrintDone])

  const handleActualizarEstado = async () => {
    try {
      const { error } = await supabase
        .from('garantias')
        .update({ estado: nuevoEstado })
        .eq('id', params.id)

      if (error) throw error

      setGarantia({ ...garantia, estado: nuevoEstado })
      setEditandoEstado(false)
      alert('Estado actualizado correctamente')
    } catch (error) {
      console.error('Error updating estado:', error)
      alert('Error al actualizar estado')
    }
  }

  // Función helper para cargar imágenes desde URL y convertirlas a base64
  const cargarImagenComoBase64 = async (url) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      console.error('Error cargando imagen:', error)
      return null
    }
  }

  // Función helper para obtener dimensiones óptimas de imagen
  const obtenerDimensionesImagen = (imgWidth, imgHeight, maxWidth, maxHeight) => {
    let width = imgWidth
    let height = imgHeight
    
    // Si la imagen es más ancha que el máximo, ajustar
    if (width > maxWidth) {
      const ratio = maxWidth / width
      width = maxWidth
      height = height * ratio
    }
    
    // Si después del ajuste la altura es mayor que el máximo, ajustar nuevamente
    if (height > maxHeight) {
      const ratio = maxHeight / height
      height = maxHeight
      width = width * ratio
    }
    
    return { width, height }
  }

  const generarPDF = async () => {
    setGenerandoPDF(true)
    try {
      const doc = new jsPDF()
      
      // Colores
      const primaryColor = [208, 206, 206] // Gris claro #d0cece
      const textColor = [51, 51, 51]
      
      // Header con logo y empresa
      doc.setFillColor(...primaryColor)
      doc.rect(0, 0, 220, 40, 'F')
      
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(22)
      doc.text('MEGA SUMINISTROS', 105, 15, { align: 'center' })
      
      doc.setFontSize(11)
      doc.text('Comprobante de Garantía', 105, 25, { align: 'center' })
      
      doc.setFontSize(9)
      doc.text('Centro Comercial Ocean Mall, Av. Del Ferrocarril #15-100 Local S2', 105, 32, { align: 'center' })
      doc.text('Tel: 3217777337 | Horario: Lun-Dom 9am-8pm', 105, 37, { align: 'center' })
      
      doc.setTextColor(...textColor)
      let yPos = 50
      
      // Número de Garantía
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.text(`GARANTÍA #${garantia.id}`, 20, yPos)
      yPos += 7
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.text(`Fecha de registro: ${format(new Date(garantia.created_at), 'dd/MM/yyyy HH:mm')}`, 20, yPos)
      yPos += 10
      
      // Estado
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text('ESTADO:', 20, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(getEstadoLabel(garantia.estado).toUpperCase(), 50, yPos)
      yPos += 10
      
      // Línea separadora
      doc.setDrawColor(200, 200, 200)
      doc.line(20, yPos, 190, yPos)
      yPos += 8
      
      // Datos del Cliente
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.text('DATOS DEL CLIENTE', 20, yPos)
      yPos += 7
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.text('Nombre:', 20, yPos)
      doc.text(garantia.nombre_cliente, 50, yPos)
      yPos += 6
      
      doc.text('Documento:', 20, yPos)
      doc.text(garantia.documento || 'No especificado', 50, yPos)
      yPos += 10
      
      // Línea separadora
      doc.line(20, yPos, 190, yPos)
      yPos += 8
      
      // Datos del Producto
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.text('DATOS DEL PRODUCTO', 20, yPos)
      yPos += 7
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.text('Referencia:', 20, yPos)
      doc.text(garantia.referencia, 50, yPos)
      yPos += 6
      
      doc.text('Marca:', 20, yPos)
      doc.text(garantia.marca, 50, yPos)
      yPos += 6
      
      if (garantia.numero_serie && garantia.numero_serie.trim()) {
        doc.text('Serial:', 20, yPos)
        doc.text(garantia.numero_serie, 50, yPos)
        yPos += 6
      }
      
      doc.text('Tipo:', 20, yPos)
      doc.text(garantia.tipo_equipo.replace('_', ' ').toUpperCase(), 50, yPos)
      yPos += 6
      
      doc.text('Fecha Compra:', 20, yPos)
      const fechaCompra = garantia.fecha_compra ? format(new Date(garantia.fecha_compra), 'dd/MM/yyyy') : 'No especificada'
      doc.text(fechaCompra, 50, yPos)
      yPos += 10
      
      // Línea separadora
      doc.line(20, yPos, 190, yPos)
      yPos += 8
      
      // Descripción de la Falla
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.text('DESCRIPCIÓN DE LA FALLA', 20, yPos)
      yPos += 7
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      const fallaLines = doc.splitTextToSize(garantia.descripcion_falla, 170)
      fallaLines.forEach(line => {
        if (yPos > 260) {
          doc.addPage()
          yPos = 20
        }
        doc.text(line, 20, yPos)
        yPos += 5
      })
      yPos += 5
      
      // Línea separadora
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }
      doc.line(20, yPos, 190, yPos)
      yPos += 8
      
      // Accesorios Incluidos
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.text('ACCESORIOS INCLUIDOS', 20, yPos)
      yPos += 7
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      
      // Solo mostrar los accesorios que estén marcados (true)
      let tieneAccesorios = false
      
      if (garantia.trae_caja === true) {
        doc.text('✓ Caja original', 25, yPos)
        yPos += 6
        tieneAccesorios = true
      }
      
      if (garantia.trae_cables === true) {
        doc.text('✓ Cables', 25, yPos)
        yPos += 6
        tieneAccesorios = true
      }
      
      if (garantia.trae_cargador === true) {
        doc.text('✓ Cargador', 25, yPos)
        yPos += 6
        tieneAccesorios = true
      }
      
      // Si no hay ningún accesorio marcado, mostrar "Sin accesorios"
      if (!tieneAccesorios) {
        doc.setFont('helvetica', 'italic')
        doc.text('Sin accesorios', 25, yPos)
        yPos += 6
        doc.setFont('helvetica', 'normal')
      }
      
      yPos += 4
      
      // Observaciones
      if (garantia.observaciones) {
        if (yPos > 240) {
          doc.addPage()
          yPos = 20
        }
        doc.line(20, yPos, 190, yPos)
        yPos += 8
        
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.text('OBSERVACIONES', 20, yPos)
        yPos += 7
        
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        const obsLines = doc.splitTextToSize(garantia.observaciones, 170)
        obsLines.forEach(line => {
          if (yPos > 260) {
            doc.addPage()
            yPos = 20
          }
          doc.text(line, 20, yPos)
          yPos += 5
        })
        yPos += 5
      }

      // ====== AGREGAR FOTOS DE EVIDENCIA AL PDF ======
      if (fotos && fotos.length > 0) {
        // Agregar separador
        if (yPos > 220) {
          doc.addPage()
          yPos = 20
        } else {
          doc.line(20, yPos, 190, yPos)
          yPos += 8
        }
        
        // Título de la sección (SIN EMOJI)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.text('FOTOS DE EVIDENCIA', 20, yPos)
        yPos += 7
        
        // Mostrar cantidad de fotos
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.text(`${fotos.length} ${fotos.length === 1 ? 'foto adjunta' : 'fotos adjuntas'}:`, 20, yPos)
        yPos += 8
        
        // Cargar todas las fotos primero
        const fotosBase64 = []
        for (let i = 0; i < fotos.length; i++) {
          try {
            console.log(`Cargando foto ${i + 1} de ${fotos.length}...`)
            const imgData = await cargarImagenComoBase64(fotos[i].url_foto)
            if (imgData) {
              fotosBase64.push({
                data: imgData,
                descripcion: fotos[i].descripcion
              })
            }
          } catch (error) {
            console.error(`Error al cargar foto ${i + 1}:`, error)
          }
        }
        
        // Mostrar miniaturas en grid (3 columnas)
        const miniaturaSize = 40
        const espacioEntreFotos = 5
        const fotasPorFila = 3
        
        for (let i = 0; i < fotosBase64.length; i++) {
          // Calcular fila y columna
          const fila = Math.floor(i / fotasPorFila)
          const columna = i % fotasPorFila
          
          // Calcular posición
          const xPos = 20 + (columna * (miniaturaSize + espacioEntreFotos))
          const yPosMiniatura = yPos + (fila * (miniaturaSize + 8))
          
          // Verificar espacio en página
          if (yPosMiniatura + miniaturaSize + 8 > 250) {
            doc.addPage()
            yPos = 20
          }
          
          // Agregar miniatura
          try {
            const img = new Image()
            img.src = fotosBase64[i].data
            await new Promise((resolve) => {
              img.onload = resolve
            })
            
            // Agregar miniatura cuadrada
            doc.addImage(fotosBase64[i].data, 'JPEG', xPos, yPosMiniatura, miniaturaSize, miniaturaSize)
            
            // Número de foto debajo
            doc.setFontSize(7)
            doc.setTextColor(80, 80, 80)
            doc.text(`Foto ${i + 1}`, xPos + miniaturaSize/2, yPosMiniatura + miniaturaSize + 3, { align: 'center' })
            doc.setTextColor(...textColor)
          } catch (error) {
            console.error(`Error al agregar miniatura ${i + 1}:`, error)
          }
        }
        
        // Actualizar yPos después de las miniaturas
        const totalFilas = Math.ceil(fotosBase64.length / fotasPorFila)
        yPos += (totalFilas * (miniaturaSize + 8)) + 5
        
        // Agregar cada foto en tamaño completo en páginas separadas
        for (let i = 0; i < fotosBase64.length; i++) {
          try {
            // Nueva página para cada foto grande
            doc.addPage()
            yPos = 20
            
            const img = new Image()
            img.src = fotosBase64[i].data
            
            await new Promise((resolve) => {
              img.onload = resolve
            })
            
            // Título de la foto
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(11)
            doc.text(`Foto ${i + 1} de ${fotosBase64.length}`, 20, yPos)
            yPos += 5
            
            if (fotosBase64[i].descripcion) {
              doc.setFont('helvetica', 'normal')
              doc.setFontSize(9)
              doc.text(fotosBase64[i].descripcion, 20, yPos)
              yPos += 8
            } else {
              yPos += 5
            }
            
            // Calcular dimensiones óptimas para foto grande
            const maxWidth = 170
            const maxHeight = 220
            const { width, height } = obtenerDimensionesImagen(
              img.width,
              img.height,
              maxWidth,
              maxHeight
            )
            
            // Centrar la imagen
            const xPos = (210 - width) / 2
            
            // Agregar la imagen grande
            doc.addImage(fotosBase64[i].data, 'JPEG', xPos, yPos, width, height)
            
          } catch (error) {
            console.error(`Error al cargar foto grande ${i + 1}:`, error)
          }
        }
      }
      
      // Footer en todas las páginas
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        
        let footerY = 270
        doc.setDrawColor(200, 200, 200)
        doc.line(20, footerY, 190, footerY)
        footerY += 5
        
        doc.setFontSize(8)
        doc.setTextColor(128, 128, 128)
        doc.text('Mega Suministros | Centro Comercial Ocean Mall Local S2', 105, footerY, { align: 'center' })
        footerY += 4
        doc.text('Tel: 3217777337 | Horario: Lun-Dom 9am-8pm', 105, footerY, { align: 'center' })
        footerY += 4
        doc.text(`Página ${i} de ${pageCount} | Garantía #${garantia.id}`, 105, footerY, { align: 'center' })
      }
      
      // Descargar PDF
      doc.save(`Garantia-${garantia.id}.pdf`)
      
      console.log('PDF generado exitosamente con fotos de evidencia')
      
    } catch (error) {
      console.error('Error al generar PDF:', error)
      alert('Error al generar el PDF: ' + error.message)
    } finally {
      setGenerandoPDF(false)
    }
  }

  const getEstadoColor = (estado) => {
    const colors = {
      recibido: 'bg-blue-100 text-blue-800 border-blue-300',
      en_revision: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      reparado: 'bg-green-100 text-green-800 border-green-300',
      entregado: 'bg-gray-100 text-gray-800 border-gray-300',
      sin_solucion: 'bg-red-100 text-red-800 border-red-300',
    }
    return colors[estado] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  const getEstadoLabel = (estado) => {
    const labels = {
      recibido: 'Recibido',
      en_revision: 'En Revisión',
      reparado: 'Reparado',
      entregado: 'Entregado',
      sin_solucion: 'Sin Solución',
    }
    return labels[estado] || estado
  }

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>
  }

  if (!garantia) {
    return <div className="text-center py-8">Garantía no encontrada</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Garantía #{garantia.id}</h1>
          <p className="text-gray-600 mt-1">
            Registrada el {format(new Date(garantia.created_at), 'dd/MM/yyyy HH:mm')}
          </p>
        </div>
        <div className="space-x-3">
          <button
            onClick={generarPDF}
            disabled={generandoPDF}
            className="btn-primary"
          >
            {generandoPDF ? '⏳ Generando PDF...' : '📄 Descargar PDF'}
          </button>
          <button
            onClick={() => router.push('/garantias')}
            className="btn-secondary"
          >
            ← Volver
          </button>
        </div>
      </div>

      {/* Estado */}
      <div className="card">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Estado Actual</h2>
            {!editandoEstado ? (
              <span className={`inline-block px-4 py-2 rounded-lg font-medium border-2 ${getEstadoColor(garantia.estado)}`}>
                {getEstadoLabel(garantia.estado)}
              </span>
            ) : (
              <div className="flex items-center space-x-3">
                <select
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value)}
                  className="input-field"
                >
                  <option value="recibido">Recibido</option>
                  <option value="en_revision">En Revisión</option>
                  <option value="reparado">Reparado</option>
                  <option value="entregado">Entregado</option>
                  <option value="sin_solucion">Sin Solución</option>
                </select>
                <button onClick={handleActualizarEstado} className="btn-primary">
                  Guardar
                </button>
                <button onClick={() => setEditandoEstado(false)} className="btn-secondary">
                  Cancelar
                </button>
              </div>
            )}
          </div>
          {!editandoEstado && (
            <button
              onClick={() => setEditandoEstado(true)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Cambiar Estado
            </button>
          )}
        </div>
      </div>

      {/* Datos del Cliente */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">📋 Datos del Cliente</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Nombre</label>
            <p className="text-gray-900 font-medium">{garantia.nombre_cliente}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">NIT / Cédula</label>
            <p className="text-gray-900 font-medium">{garantia.documento}</p>
          </div>
        </div>
      </div>

      {/* Datos del Producto */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">🔧 Datos del Producto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Referencia</label>
            <p className="text-gray-900 font-medium">{garantia.referencia}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Marca</label>
            <p className="text-gray-900 font-medium">{garantia.marca}</p>
          </div>
          {garantia.numero_serie && (
            <div>
              <label className="text-sm font-medium text-gray-500">Serial / Número de Serie</label>
              <p className="text-gray-900 font-medium">{garantia.numero_serie}</p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-500">Tipo de Equipo</label>
            <p className="text-gray-900 font-medium capitalize">
              {garantia.tipo_equipo.replace('_', ' ')}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Fecha de Compra</label>
            <p className="text-gray-900 font-medium">
              {garantia.fecha_compra 
                ? format(new Date(garantia.fecha_compra), 'dd/MM/yyyy')
                : 'No especificada'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Descripción de la Falla */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">⚠️ Descripción de la Falla</h2>
        <p className="text-gray-900 whitespace-pre-wrap">{garantia.descripcion_falla}</p>
      </div>

      {/* Accesorios */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">📦 Accesorios Incluidos</h2>
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <span className={`w-6 h-6 rounded flex items-center justify-center ${garantia.trae_caja ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              {garantia.trae_caja ? '✓' : '✗'}
            </span>
            <span className="text-gray-700">Caja original</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`w-6 h-6 rounded flex items-center justify-center ${garantia.trae_cables ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              {garantia.trae_cables ? '✓' : '✗'}
            </span>
            <span className="text-gray-700">Cables</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`w-6 h-6 rounded flex items-center justify-center ${garantia.trae_cargador ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              {garantia.trae_cargador ? '✓' : '✗'}
            </span>
            <span className="text-gray-700">Cargador</span>
          </div>
        </div>
      </div>

      {/* Observaciones */}
      {garantia.observaciones && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📝 Observaciones</h2>
          <p className="text-gray-900 whitespace-pre-wrap">{garantia.observaciones}</p>
        </div>
      )}

      {/* Fotos de Evidencia */}
      {fotos.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📸 Fotos de Evidencia ({fotos.length})</h2>
          <p className="text-sm text-gray-600 mb-4">
            Estas fotos se incluyen automáticamente en el PDF de garantía
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {fotos.map((foto, index) => (
              <div
                key={foto.id}
                className="relative group cursor-pointer"
                onClick={() => setViendoFoto(foto.url_foto)}
              >
                <img
                  src={foto.url_foto}
                  alt={foto.descripcion || `Evidencia ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-colors"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                  <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
                {foto.descripcion && (
                  <p className="text-xs text-gray-500 mt-1 truncate">{foto.descripcion}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal para ver foto completa */}
      {viendoFoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setViendoFoto(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
              onClick={() => setViendoFoto(null)}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={viendoFoto}
              alt="Vista completa"
              className="max-w-full max-h-screen object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Timeline de Estado */}
      <div className="card bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">⏱️ Información de Registro</h2>
        <div className="space-y-2">
          <div>
            <span className="text-sm font-medium text-gray-500">Fecha de Registro:</span>
            <span className="ml-2 text-gray-900">
              {format(new Date(garantia.created_at), 'dd/MM/yyyy HH:mm')}
            </span>
          </div>
          {garantia.updated_at && garantia.updated_at !== garantia.created_at && (
            <div>
              <span className="text-sm font-medium text-gray-500">Última Actualización:</span>
              <span className="ml-2 text-gray-900">
                {format(new Date(garantia.updated_at), 'dd/MM/yyyy HH:mm')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
