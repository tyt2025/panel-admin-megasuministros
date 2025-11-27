'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function TallerPage() {
  const [servicios, setServicios] = useState([])
  const [filteredServicios, setFilteredServicios] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('todos')
  const [stats, setStats] = useState({})
  
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
    cargarServicios()
  }, [])

  useEffect(() => {
    filtrarServicios()
  }, [searchTerm, estadoFilter, servicios])

  async function cargarServicios() {
    try {
      const { data, error } = await supabase
        .from('taller')
        .select('*')
        .order('fecha_ingreso', { ascending: false })

      if (error) throw error

      setServicios(data || [])
      calcularEstadisticas(data || [])
    } catch (error) {
      console.error('Error:', error)
      alert('Error al cargar servicios')
    } finally {
      setLoading(false)
    }
  }

  function calcularEstadisticas(data) {
    const stats = {
      total: data.length,
      recibido: data.filter(s => s.estado === 'recibido').length,
      diagnostico: data.filter(s => s.estado === 'diagnostico').length,
      reparando: data.filter(s => s.estado === 'reparando').length,
      listo: data.filter(s => s.estado === 'listo').length,
      abandonados: data.filter(s => diasTranscurridos(s.fecha_ingreso) > 90 && s.estado !== 'entregado').length
    }
    setStats(stats)
  }

  function filtrarServicios() {
    let filtered = servicios

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.nombre_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.telefono?.includes(searchTerm) ||
        s.referencia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id?.toString().includes(searchTerm)
      )
    }

    // Filtrar por estado
    if (estadoFilter !== 'todos') {
      filtered = filtered.filter(s => s.estado === estadoFilter)
    }

    setFilteredServicios(filtered)
  }

  function diasTranscurridos(fechaIngreso) {
    const hoy = new Date()
    const ingreso = new Date(fechaIngreso)
    const diff = Math.floor((hoy - ingreso) / (1000 * 60 * 60 * 24))
    return diff
  }

  function formatearFecha(fecha) {
    if (!fecha) return '-'
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando servicios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">🛠️ Taller</h1>
          <p className="text-gray-600">Gestión de servicios de mantenimiento y reparación</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
          >
            <span className="text-xl">🏠</span>
            Inicio
          </button>
          <Link
            href="/taller/nuevo"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Nuevo Servicio
          </Link>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Total</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total || 0}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow">
          <p className="text-blue-600 text-sm">📥 Recibidos</p>
          <p className="text-2xl font-bold text-blue-800">{stats.recibido || 0}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow">
          <p className="text-yellow-600 text-sm">🔍 Diagnóstico</p>
          <p className="text-2xl font-bold text-yellow-800">{stats.diagnostico || 0}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg shadow">
          <p className="text-orange-600 text-sm">⚙️ Reparando</p>
          <p className="text-2xl font-bold text-orange-800">{stats.reparando || 0}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow">
          <p className="text-green-600 text-sm">✅ Listos</p>
          <p className="text-2xl font-bold text-green-800">{stats.listo || 0}</p>
        </div>
      </div>

      {stats.abandonados > 0 && (
        <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6">
          <p className="text-purple-800">
            <strong>⚠️ {stats.abandonados}</strong> equipo(s) con más de 90 días sin recoger
          </p>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔍 Buscar
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cliente, teléfono, referencia, marca, #servicio..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📊 Filtrar por Estado
            </label>
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todos">Todos los estados</option>
              {Object.entries(estados).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.icon} {value.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="bg-white rounded-lg shadow mb-4 p-4">
        <p className="text-gray-600">
          Mostrando <strong>{filteredServicios.length}</strong> de <strong>{servicios.length}</strong> servicios
        </p>
      </div>

      {/* Lista de servicios */}
      {filteredServicios.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg">No se encontraron servicios</p>
          {searchTerm || estadoFilter !== 'todos' ? (
            <button
              onClick={() => {
                setSearchTerm('')
                setEstadoFilter('todos')
              }}
              className="mt-4 text-blue-600 hover:text-blue-700"
            >
              Limpiar filtros
            </button>
          ) : (
            <Link href="/taller/nuevo" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
              Crear primer servicio
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredServicios.map((servicio) => {
            const dias = diasTranscurridos(servicio.fecha_ingreso)
            const esAbandonado = dias > 90 && servicio.estado !== 'entregado'
            const estadoInfo = estados[servicio.estado] || estados.recibido
            const saldoPendiente = (servicio.valor_servicio || 0) - (servicio.abono || 0)

            return (
              <div
                key={servicio.id}
                className={`bg-white rounded-lg shadow hover:shadow-md transition p-6 ${
                  esAbandonado ? 'border-l-4 border-purple-500' : ''
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Info principal */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono text-gray-500">
                        #{servicio.id}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${estadoInfo.color}`}>
                        {estadoInfo.icon} {estadoInfo.label}
                      </span>
                      {esAbandonado && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          🚫 Abandonado ({dias} días)
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                      {servicio.nombre_cliente}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <p>📱 {servicio.telefono}</p>
                      <p>💻 {servicio.tipo_equipo} - {servicio.marca}</p>
                      <p>📦 Ref: {servicio.referencia}</p>
                      <p>🏷️ {servicio.tipo_servicio}</p>
                    </div>

                    {/* Información de pagos */}
                    {servicio.valor_servicio > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Valor</p>
                            <p className="font-bold text-gray-800">{formatearMoneda(servicio.valor_servicio)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Abono</p>
                            <p className="font-bold text-green-600">{formatearMoneda(servicio.abono)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Saldo</p>
                            <p className={`font-bold ${saldoPendiente > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {formatearMoneda(saldoPendiente)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info secundaria */}
                  <div className="text-sm text-gray-600 text-right">
                    <p className="mb-2">
                      📅 Ingreso: <strong>{formatearFecha(servicio.fecha_ingreso)}</strong>
                    </p>
                    <p className="text-gray-500">
                      {dias === 0 ? 'Hoy' : `${dias} día${dias !== 1 ? 's' : ''}`}
                    </p>
                    {servicio.fotos && servicio.fotos.length > 0 && (
                      <p className="mt-2">
                        📸 {servicio.fotos.length} foto{servicio.fotos.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col gap-2">
                    {/* Botón Iniciar Servicio - solo cuando está recibido */}
                    {servicio.estado === 'recibido' && (
                      <button
                        onClick={async () => {
                          if (!confirm('¿Iniciar el servicio? El estado cambiará a "En Diagnóstico"')) return
                          
                          try {
                            const { error } = await supabase
                              .from('taller')
                              .update({ 
                                estado: 'diagnostico',
                                fecha_actualizacion: new Date().toISOString()
                              })
                              .eq('id', servicio.id)
                            
                            if (error) throw error
                            
                            // Recargar servicios
                            cargarServicios()
                            alert('✅ Servicio iniciado')
                          } catch (error) {
                            console.error('Error:', error)
                            alert('Error al iniciar el servicio')
                          }
                        }}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition text-center font-semibold"
                      >
                        ▶️ Iniciar Servicio
                      </button>
                    )}
                    
                    <Link
                      href={`/taller/${servicio.id}`}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition text-center"
                    >
                      Ver Detalle
                    </Link>

                    <Link
                      href={`/taller/${servicio.id}/editar`}
                      className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition text-center"
                    >
                      ✏️ Editar
                    </Link>

                    <button
                      onClick={async () => {
                        if (!confirm('⚠️ ¿Estás seguro de eliminar este servicio? Esta acción no se puede deshacer.')) return
                        
                        try {
                          // Primero eliminar las fotos del storage si existen
                          if (servicio.fotos && servicio.fotos.length > 0) {
                            for (const fotoUrl of servicio.fotos) {
                              const fileName = fotoUrl.split('/').pop()
                              await supabase.storage
                                .from('taller-fotos')
                                .remove([fileName])
                            }
                          }

                          // Luego eliminar el servicio
                          const { error } = await supabase
                            .from('taller')
                            .delete()
                            .eq('id', servicio.id)
                          
                          if (error) throw error
                          
                          // Recargar servicios
                          cargarServicios()
                          alert('✅ Servicio eliminado correctamente')
                        } catch (error) {
                          console.error('Error:', error)
                          alert('Error al eliminar el servicio')
                        }
                      }}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition text-center"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
