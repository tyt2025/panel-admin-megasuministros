'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { jsPDF } from 'jspdf'

export default function DetalleServicioTaller({ params }) {
  const [servicio, setServicio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actualizando, setActualizando] = useState(false)
  const [generandoPDF, setGenerandoPDF] = useState(false)
  const [mostrarGaleria, setMostrarGaleria] = useState(false)
  const [imagenActual, setImagenActual] = useState(0)
  
  const router = useRouter()

  const estados = {
    'recibido': { label: 'Recibido', color: 'bg-blue-100 text-blue-800', icon: '📥' },
    'diagnostico': { label: 'En Diagnóstico', color: 'bg-yellow-100 text-yellow-800', icon: '🔍' },
    'reparando': { label: 'Reparando', color: 'bg-orange-100 text-orange-800', icon: '⚙️' },
    'listo': { label: 'Listo', color: 'bg-green-100 text-green-800', icon: '✅' },
    'entregado': { label: 'Entregado', color: 'bg-gray-100 text-gray-800', icon: '📤' },
    'sin_solucion': { label: 'Sin Solución', color: 'bg-red-100 text-red-800', icon: '❌' },
    'abandonado': { label: 'Abandonado', color: 'bg-purple-100 text-purple-800', icon: '🚫' }
  }

  useEffect(() => {
    cargarServicio()
  }, [params.id])

  async function cargarServicio() {
    try {
      const { data, error } = await supabase
        .from('taller')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      setServicio(data)
    } catch (error) {
      console.error('Error:', error)
      alert('Error al cargar el servicio')
    } finally {
      setLoading(false)
    }
  }

  async function cambiarEstado(nuevoEstado) {
    if (!confirm(`¿Cambiar estado a "${estados[nuevoEstado].label}"?`)) return

    setActualizando(true)
    try {
      const updates = {
        estado: nuevoEstado,
        fecha_actualizacion: new Date().toISOString()
      }

      // Si se marca como entregado, guardar fecha de entrega
      if (nuevoEstado === 'entregado') {
        updates.fecha_entrega = new Date().toISOString()
      }

      const { error } = await supabase
        .from('taller')
        .update(updates)
        .eq('id', params.id)

      if (error) throw error

      await cargarServicio()
      alert('✅ Estado actualizado')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al actualizar el estado')
    } finally {
      setActualizando(false)
    }
  }

  function diasTranscurridos(fechaIngreso) {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0) // Resetear hora a medianoche
    
    const ingreso = new Date(fechaIngreso)
    ingreso.setHours(0, 0, 0, 0) // Resetear hora a medianoche
    
    const diffTime = hoy - ingreso
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    // Asegurar que nunca sea negativo
    return Math.max(0, diffDays)
  }

  function formatearFecha(fecha) {
    if (!fecha) return '-'
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function formatearMoneda(valor) {
    if (!valor) return '$0'
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor)
  }

  async function generarPDF() {
    setGenerandoPDF(true)
    
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 15 // Reducido de 20 a 15
      let yPos = 15

      // Función helper para cargar imágenes
      const loadImage = (url) => {
        return new Promise((resolve) => {
          const img = new Image()
          img.crossOrigin = 'Anonymous'
          img.onload = () => resolve(img)
          img.onerror = () => resolve(null)
          img.src = url
        })
      }

      // ==================== PÁGINA 1: COMPROBANTE ====================

      // Header con logo desde Supabase - MÁS COMPACTO
      doc.setFillColor(208, 206, 206) // Gris claro #d0cece
      doc.rect(0, 0, pageWidth, 35, 'F') // Reducido de 40 a 35
      
      // Intentar cargar el logo desde Supabase
      try {
        const logoUrl = 'https://fmxxoitoyrayhlibfaty.supabase.co/storage/v1/object/public/Imagenes/logo%20mega.png'
        const logoImg = await loadImage(logoUrl)
        if (logoImg) {
          doc.addImage(logoImg, 'PNG', 8, 3, 25, 25) // Logo más pequeño
        }
      } catch (error) {
        console.log('Logo no cargado:', error)
      }
      
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(16) // Reducido de 20 a 16
      doc.setFont('helvetica', 'bold')
      doc.text('MEGA SUMINISTROS', pageWidth / 2, 12, { align: 'center' })
      
      doc.setFontSize(9) // Reducido de 12 a 9
      doc.setFont('helvetica', 'normal')
      doc.text('Comprobante de Servicio Técnico', pageWidth / 2, 20, { align: 'center' })
      doc.text('Centro Comercial Ocean Mall, Av. Del Ferrocarril #15-100 Local S2', pageWidth / 2, 26, { align: 'center' })
      doc.text('Tel: 3217777337 | Horario: Lun-Dom 9am-8pm', pageWidth / 2, 31, { align: 'center' })

      yPos = 42

      // Información principal - MÁS COMPACTO
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(13) // Reducido de 16 a 13
      doc.setFont('helvetica', 'bold')
      doc.text(`SERVICIO #${servicio.id}`, margin, yPos)
      
      yPos += 7 // Reducido de 10 a 7
      doc.setFontSize(10) // Reducido de 12 a 10
      doc.text(servicio.tipo_servicio.charAt(0).toUpperCase() + servicio.tipo_servicio.slice(1), margin, yPos)

      yPos += 6 // Reducido de 8 a 6
      doc.setFontSize(8) // Reducido de 10 a 8
      doc.setFont('helvetica', 'normal')
      doc.text(`Fecha de ingreso: ${formatearFecha(servicio.fecha_ingreso).split(',')[0]}`, margin, yPos)

      yPos += 7 // Reducido de 10 a 7
      const estadoInfo = estados[servicio.estado] || estados.recibido
      doc.setFontSize(9) // Reducido de 11 a 9
      doc.setFont('helvetica', 'bold')
      doc.text(`ESTADO: ${estadoInfo.label.toUpperCase()}`, margin, yPos)

      // Sección: Datos del Cliente - MÁS COMPACTO
      yPos += 10 // Reducido de 15 a 10
      doc.setFillColor(240, 240, 240)
      doc.rect(margin, yPos, pageWidth - 2 * margin, 6, 'F') // Reducido de 8 a 6
      doc.setFontSize(9) // Reducido de 11 a 9
      doc.setFont('helvetica', 'bold')
      doc.text('DATOS DEL CLIENTE', margin + 2, yPos + 4.5)

      yPos += 9 // Reducido de 12 a 9
      doc.setFontSize(8) // Reducido de 10 a 8
      doc.setFont('helvetica', 'normal')
      doc.text(`Nombre: ${servicio.nombre_cliente}`, margin + 2, yPos)
      yPos += 5 // Reducido de 6 a 5
      doc.text(`Teléfono: ${servicio.telefono}`, margin + 2, yPos)

      // Sección: Datos del Equipo - MÁS COMPACTO
      yPos += 9 // Reducido de 12 a 9
      doc.setFillColor(240, 240, 240)
      doc.rect(margin, yPos, pageWidth - 2 * margin, 6, 'F') // Reducido de 8 a 6
      doc.setFontSize(9) // Reducido de 11 a 9
      doc.setFont('helvetica', 'bold')
      doc.text('DATOS DEL EQUIPO', margin + 2, yPos + 4.5)

      yPos += 9 // Reducido de 12 a 9
      doc.setFontSize(8) // Reducido de 10 a 8
      doc.setFont('helvetica', 'normal')
      doc.text(`Tipo: ${servicio.tipo_equipo}`, margin + 2, yPos)
      yPos += 5 // Reducido de 6 a 5
      doc.text(`Marca: ${servicio.marca}`, margin + 2, yPos)
      yPos += 5 // Reducido de 6 a 5
      doc.text(`Referencia: ${servicio.referencia}`, margin + 2, yPos)
      
      // Agregar Serial / Número de Serie si existe
      if (servicio.numero_serie && servicio.numero_serie.trim()) {
        yPos += 5 // Reducido de 6 a 5
        doc.text(`Serial: ${servicio.numero_serie}`, margin + 2, yPos)
      }

      // Sección: Observaciones o Trabajo a Realizar - TÍTULO CAMBIADO
      if (servicio.observaciones && servicio.observaciones.trim()) {
        yPos += 9 // Reducido de 12 a 9
        doc.setFillColor(240, 240, 240)
        doc.rect(margin, yPos, pageWidth - 2 * margin, 6, 'F') // Reducido de 8 a 6
        doc.setFontSize(9) // Reducido de 11 a 9
        doc.setFont('helvetica', 'bold')
        doc.text('OBSERVACIONES O TRABAJO A REALIZAR', margin + 2, yPos + 4.5)

        yPos += 9 // Reducido de 12 a 9
        doc.setFontSize(8) // Reducido de 10 a 8
        doc.setFont('helvetica', 'normal')
        
        // Dividir el texto en líneas para que no se salga del margen
        const observacionesLineas = doc.splitTextToSize(servicio.observaciones, pageWidth - 2 * margin - 4)
        observacionesLineas.forEach(linea => {
          doc.text(linea, margin + 2, yPos)
          yPos += 4 // Reducido de 5 a 4
        })
      }

      // Sección: Accesorios - MÁS COMPACTO
      yPos += 9 // Reducido de 12 a 9
      doc.setFillColor(240, 240, 240)
      doc.rect(margin, yPos, pageWidth - 2 * margin, 6, 'F') // Reducido de 8 a 6
      doc.setFontSize(9) // Reducido de 11 a 9
      doc.setFont('helvetica', 'bold')
      doc.text('ACCESORIOS INCLUIDOS', margin + 2, yPos + 4.5)

      yPos += 9 // Reducido de 12 a 9
      doc.setFontSize(8) // Reducido de 10 a 8
      doc.setFont('helvetica', 'normal')
      
      const accesorios = []
      if (servicio.trae_cables) accesorios.push('• Cables')
      if (servicio.trae_cargador) accesorios.push('• Cargador')
      if (servicio.trae_caja) accesorios.push('• Caja')
      if (servicio.otros_accesorios) accesorios.push(`• ${servicio.otros_accesorios}`)
      
      if (accesorios.length === 0) {
        doc.text('Sin accesorios', margin + 2, yPos)
        yPos += 5 // Reducido de 6 a 5
      } else {
        accesorios.forEach(acc => {
          doc.text(acc, margin + 2, yPos)
          yPos += 4 // Reducido de 6 a 4
        })
        yPos += 1 // Ajuste adicional
      }

      // Sección: INFORMACIÓN DE PAGO - MÁS COMPACTA
      if (servicio.valor_servicio > 0) {
        yPos += 6 // Reducido de 6 a 6
        doc.setFillColor(240, 240, 240)
        doc.rect(margin, yPos, pageWidth - 2 * margin, 6, 'F') // Reducido de 8 a 6
        doc.setFontSize(9) // Reducido de 11 a 9
        doc.setFont('helvetica', 'bold')
        doc.text('INFORMACION DE PAGO', margin + 2, yPos + 4.5)

        yPos += 9 // Reducido de 12 a 9
        doc.setFontSize(8) // Reducido de 10 a 8
        doc.setFont('helvetica', 'normal')
        
        const valorServicio = parseFloat(servicio.valor_servicio) || 0
        const abono = parseFloat(servicio.abono) || 0
        const totalPagar = valorServicio - abono

        doc.text(`Valor del servicio: ${formatearMoneda(valorServicio)}`, margin + 2, yPos)
        yPos += 5 // Reducido de 6 a 5
        doc.setTextColor(0, 150, 0)
        doc.text(`Abono realizado: ${formatearMoneda(abono)}`, margin + 2, yPos)
        yPos += 7 // Reducido de 8 a 7
        
        // Total a pagar con fondo de color
        doc.setFontSize(10) // Reducido de 12 a 10
        doc.setFont('helvetica', 'bold')
        if (totalPagar > 0) {
          doc.setFillColor(240, 240, 240) // Gris claro
          doc.rect(margin, yPos - 4, pageWidth - 2 * margin, 8, 'F') // Reducido de 10 a 8
          doc.setTextColor(166, 166, 166) // Gris #a6a6a6
          doc.text(`SALDO PENDIENTE: ${formatearMoneda(totalPagar)}`, margin + 2, yPos + 1.5)
        } else {
          doc.setFillColor(220, 252, 231) // Verde claro
          doc.rect(margin, yPos - 4, pageWidth - 2 * margin, 8, 'F') // Reducido de 10 a 8
          doc.setTextColor(21, 128, 61)
          doc.text(`PAGADO COMPLETAMENTE`, margin + 2, yPos + 1.5)
        }
        doc.setTextColor(0, 0, 0)
        yPos += 10 // Reducido de 12 a 10
      }

      // Sección de información importante - siempre debe caber en la página con los nuevos tamaños
      yPos += 6 // Espacio antes de información importante
      
      // Sección: Información Importante - MÁS COMPACTA
      doc.setFillColor(255, 251, 235) // Amarillo claro
      doc.rect(margin, yPos, pageWidth - 2 * margin, 35, 'F') // Reducido de 45 a 35
      
      doc.setFontSize(8) // Reducido de 10 a 8
      doc.setFont('helvetica', 'bold')
      doc.text('INFORMACIÓN IMPORTANTE', margin + 2, yPos + 5)
      
      doc.setFontSize(7) // Reducido de 9 a 7
      doc.setFont('helvetica', 'normal')
      const dias = diasTranscurridos(servicio.fecha_ingreso)
      const diasRestantes = 90 - dias
      
      yPos += 10 // Reducido de 12 a 10
      doc.text('• Según la Ley 1480 de 2011, los equipos no reclamados después de 90 días', margin + 3, yPos)
      yPos += 4 // Reducido de 5 a 4
      doc.text('  se consideran abandonados y pueden ser dispuestos por el establecimiento.', margin + 3, yPos)
      yPos += 6 // Reducido de 7 a 6
      doc.setFont('helvetica', 'bold')
      doc.text(`• Días transcurridos: ${dias} | Días restantes: ${diasRestantes}`, margin + 3, yPos)
      doc.setFont('helvetica', 'normal')
      yPos += 6 // Reducido de 7 a 6
      doc.text('• Conserve este comprobante para reclamar su equipo.', margin + 3, yPos)

      // Footer - Posición fija en la parte inferior - MÁS COMPACTO
      const footerY = pageHeight - 15
      doc.setFontSize(7) // Reducido de 8 a 7
      doc.setTextColor(100, 100, 100)
      doc.text('Mega Suministros | Centro Comercial Ocean Mall Local S2', pageWidth / 2, footerY, { align: 'center' })
      doc.text('Tel: 3217777337 | Horario: Lun-Dom 9am-8pm', pageWidth / 2, footerY + 4, { align: 'center' })
      doc.text(`Página 1 de ${servicio.fotos && servicio.fotos.length > 0 ? '2' : '1'} | Servicio #${servicio.id}`, pageWidth / 2, footerY + 8, { align: 'center' })

      // ==================== PÁGINA 2: EVIDENCIAS FOTOGRÁFICAS ====================
      
      if (servicio.fotos && servicio.fotos.length > 0) {
        doc.addPage()
        yPos = 20

        // Header de evidencias
        doc.setFillColor(166, 166, 166) // Gris #a6a6a6
        doc.rect(0, 0, pageWidth, 50, 'F')
        
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(24)
        doc.setFont('helvetica', 'bold')
        doc.text('EVIDENCIAS FOTOGRÁFICAS', pageWidth / 2, 20, { align: 'center' })
        
        doc.setFontSize(14)
        doc.setFont('helvetica', 'normal')
        doc.text(`Servicio #${servicio.id}`, pageWidth / 2, 32, { align: 'center' })
        doc.text(`${servicio.nombre_cliente} - ${servicio.tipo_equipo}`, pageWidth / 2, 42, { align: 'center' })

        yPos = 60
        doc.setTextColor(0, 0, 0)

        // Cargar y mostrar fotos
        for (let i = 0; i < servicio.fotos.length; i++) {
          const fotoUrl = servicio.fotos[i]
          
          try {
            const img = await loadImage(fotoUrl)
            
            if (img) {
              // Calcular dimensiones manteniendo proporción
              const maxWidth = pageWidth - 2 * margin
              const maxHeight = 70
              let width = img.width
              let height = img.height
              
              if (width > maxWidth) {
                height = (maxWidth / width) * height
                width = maxWidth
              }
              if (height > maxHeight) {
                width = (maxHeight / height) * width
                height = maxHeight
              }

              // Centrar imagen
              const xPos = (pageWidth - width) / 2

              // Si no cabe en la página, agregar nueva página
              if (yPos + height + 30 > pageHeight - 30) {
                doc.addPage()
                yPos = 20
              }

              // Etiqueta de la foto
              doc.setFontSize(10)
              doc.setFont('helvetica', 'bold')
              doc.setFillColor(59, 130, 246) // Azul
              doc.rect(margin, yPos, 40, 8, 'F')
              doc.setTextColor(255, 255, 255)
              doc.text('INICIAL', margin + 20, yPos + 5.5, { align: 'center' })
              doc.setTextColor(0, 0, 0)

              yPos += 12

              // Nombre del archivo
              const nombreArchivo = fotoUrl.split('/').pop().substring(0, 40)
              doc.setFontSize(9)
              doc.setFont('helvetica', 'normal')
              doc.text(nombreArchivo, margin, yPos)
              yPos += 6

              // Imagen
              doc.addImage(img, 'JPEG', xPos, yPos, width, height)
              yPos += height + 8

              // Fecha
              doc.setFontSize(8)
              doc.setTextColor(100, 100, 100)
              doc.text(`Fecha: ${formatearFecha(servicio.fecha_ingreso).split(',')[0]}`, margin, yPos)
              
              yPos += 15
            }
          } catch (error) {
            console.error('Error al cargar foto:', error)
          }
        }

        // Footer de página de evidencias
        yPos = pageHeight - 20
        doc.setFontSize(8)
        doc.setTextColor(100, 100, 100)
        doc.text('Mega Suministros | Centro Comercial Ocean Mall Local S2', pageWidth / 2, yPos, { align: 'center' })
        yPos += 4
        doc.text('Tel: 3217777337 | Horario: Lun-Dom 9am-8pm', pageWidth / 2, yPos, { align: 'center' })
        yPos += 4
        doc.text(`Página 2 de 2 | Servicio #${servicio.id} | Evidencias Fotográficas`, pageWidth / 2, yPos, { align: 'center' })
      }

      // Guardar PDF
      doc.save(`Servicio-Taller-${servicio.id}.pdf`)
      alert('✅ PDF generado exitosamente')
      
    } catch (error) {
      console.error('Error al generar PDF:', error)
      alert('Error al generar el PDF: ' + error.message)
    } finally {
      setGenerandoPDF(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando servicio...</p>
        </div>
      </div>
    )
  }

  if (!servicio) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800">Servicio no encontrado</p>
          <button
            onClick={() => router.push('/taller')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    )
  }

  const dias = diasTranscurridos(servicio.fecha_ingreso)
  const esAbandonado = dias > 90 && servicio.estado !== 'entregado'
  const estadoInfo = estados[servicio.estado] || estados.recibido
  const valorServicio = parseFloat(servicio.valor_servicio) || 0
  const abono = parseFloat(servicio.abono) || 0
  const totalPagar = valorServicio - abono

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header con acciones */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <button
            onClick={() => router.push('/taller')}
            className="text-blue-600 hover:text-blue-700 mb-2 flex items-center gap-2"
          >
            ← Volver a la lista
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            Servicio #{servicio.id}
          </h1>
        </div>
        <button
          onClick={generarPDF}
          disabled={generandoPDF}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
        >
          {generandoPDF ? (
            <>
              <span className="animate-spin">⏳</span>
              Generando PDF...
            </>
          ) : (
            <>
              📄 Descargar PDF
            </>
          )}
        </button>
      </div>

      {/* Alerta de abandonado */}
      {esAbandonado && (
        <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6">
          <p className="text-purple-800 font-bold">
            🚫 EQUIPO ABANDONADO - Han transcurrido {dias} días desde el ingreso
          </p>
          <p className="text-purple-700 text-sm mt-1">
            Según la Ley 1480 de 2011, después de 90 días el equipo puede ser considerado abandonado
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info general */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${estadoInfo.color}`}>
                {estadoInfo.icon} {estadoInfo.label}
              </span>
              <span className="text-gray-600">
                {dias === 0 ? 'Hoy' : `${dias} día${dias !== 1 ? 's' : ''} transcurrido${dias !== 1 ? 's' : ''}`}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Tipo de Servicio</h3>
                <p className="text-lg font-semibold capitalize">{servicio.tipo_servicio}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Cliente</h3>
                  <p className="text-lg font-semibold">{servicio.nombre_cliente}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Teléfono</h3>
                  <p className="text-lg font-semibold">{servicio.telefono}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Equipo</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Tipo</p>
                    <p className="font-medium capitalize">{servicio.tipo_equipo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Marca</p>
                    <p className="font-medium">{servicio.marca}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Referencia</p>
                    <p className="font-medium">{servicio.referencia}</p>
                  </div>
                  {servicio.numero_serie && servicio.numero_serie.trim() && (
                    <div>
                      <p className="text-xs text-gray-500">Serial / Número de Serie</p>
                      <p className="font-medium">{servicio.numero_serie}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Accesorios</h3>
                <div className="flex flex-wrap gap-2">
                  {servicio.trae_cables && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      📌 Cables
                    </span>
                  )}
                  {servicio.trae_cargador && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      🔌 Cargador
                    </span>
                  )}
                  {servicio.trae_caja && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      📦 Caja
                    </span>
                  )}
                  {servicio.otros_accesorios && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                      {servicio.otros_accesorios}
                    </span>
                  )}
                  {!servicio.trae_cables && !servicio.trae_cargador && !servicio.trae_caja && !servicio.otros_accesorios && (
                    <span className="text-gray-500 text-sm">Sin accesorios</span>
                  )}
                </div>
              </div>

              {servicio.observaciones && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Observaciones o Trabajo a Realizar</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{servicio.observaciones}</p>
                </div>
              )}
            </div>
          </div>

          {/* Información de Pago */}
          {valorServicio > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 Información de Pago</h3>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Valor del Servicio</p>
                  <p className="text-2xl font-bold text-gray-800">{formatearMoneda(valorServicio)}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Abono Realizado</p>
                  <p className="text-2xl font-bold text-green-600">{formatearMoneda(abono)}</p>
                </div>
                <div className={`p-4 rounded-lg ${totalPagar > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                  <p className="text-sm text-gray-600 mb-1">Saldo Pendiente</p>
                  <p className={`text-2xl font-bold ${totalPagar > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatearMoneda(totalPagar)}
                  </p>
                </div>
              </div>

              {totalPagar > 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ El cliente debe pagar <strong>{formatearMoneda(totalPagar)}</strong> antes de retirar el equipo
                  </p>
                </div>
              )}

              {totalPagar === 0 && abono > 0 && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4">
                  <p className="text-green-800 text-sm">
                    ✅ El servicio está pagado completamente
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Galería de fotos */}
          {servicio.fotos && servicio.fotos.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                📸 Fotos del Equipo ({servicio.fotos.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {servicio.fotos.map((foto, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setImagenActual(index)
                      setMostrarGaleria(true)
                    }}
                    className="relative group cursor-pointer"
                  >
                    <img
                      src={foto}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition rounded-lg flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 text-2xl">
                        🔍
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar con fechas y cambio de estado */}
        <div className="space-y-6">
          {/* Fechas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📅 Fechas</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Ingreso</p>
                <p className="font-medium">{formatearFecha(servicio.fecha_ingreso)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Última actualización</p>
                <p className="font-medium">{formatearFecha(servicio.fecha_actualizacion)}</p>
              </div>
              {servicio.fecha_entrega && (
                <div>
                  <p className="text-sm text-gray-500">Entrega</p>
                  <p className="font-medium">{formatearFecha(servicio.fecha_entrega)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Botón de Iniciar Servicio (solo cuando está recibido) */}
          {servicio.estado === 'recibido' && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow p-6 border-2 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    🚀 ¿Listo para empezar?
                  </h3>
                  <p className="text-sm text-gray-600">
                    Inicia el diagnóstico o reparación del equipo
                  </p>
                </div>
                <button
                  onClick={() => cambiarEstado('diagnostico')}
                  disabled={actualizando}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {actualizando ? '⏳ Iniciando...' : '▶️ Iniciar Servicio'}
                </button>
              </div>
            </div>
          )}

          {/* Cambiar estado */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Cambiar Estado</h3>
            <div className="space-y-2">
              {Object.entries(estados).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => cambiarEstado(key)}
                  disabled={actualizando || servicio.estado === key}
                  className={`w-full text-left px-4 py-2 rounded-lg transition ${
                    servicio.estado === key
                      ? `${value.color} font-medium`
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  } disabled:opacity-50`}
                >
                  {value.icon} {value.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de galería */}
      {mostrarGaleria && servicio.fotos && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={() => setMostrarGaleria(false)}
        >
          <button
            onClick={() => setMostrarGaleria(false)}
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300"
          >
            ×
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              setImagenActual(prev => (prev > 0 ? prev - 1 : servicio.fotos.length - 1))
            }}
            className="absolute left-4 text-white text-4xl hover:text-gray-300"
          >
            ‹
          </button>

          <div className="max-w-4xl max-h-screen p-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={servicio.fotos[imagenActual]}
              alt={`Foto ${imagenActual + 1}`}
              className="max-w-full max-h-[90vh] object-contain mx-auto"
            />
            <p className="text-white text-center mt-4">
              {imagenActual + 1} de {servicio.fotos.length}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              setImagenActual(prev => (prev < servicio.fotos.length - 1 ? prev + 1 : 0))
            }}
            className="absolute right-4 text-white text-4xl hover:text-gray-300"
          >
            ›
          </button>
        </div>
      )}
    </div>
  )
}
