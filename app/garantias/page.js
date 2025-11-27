'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'

export default function Garantias() {
  const [garantias, setGarantias] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
    loadGarantias(JSON.parse(userData))
  }, [router])

  const loadGarantias = async (userData) => {
    try {
      const { data, error } = await supabase
        .from('garantias')
        .select('*')
        .eq('vendedor_id', userData.vendedor_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setGarantias(data || [])
    } catch (error) {
      console.error('Error loading garantias:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este registro de garantía?')) return

    try {
      const { error } = await supabase
        .from('garantias')
        .delete()
        .eq('id', id)

      if (error) throw error
      setGarantias(garantias.filter(g => g.id !== id))
      alert('Garantía eliminada')
    } catch (error) {
      console.error('Error deleting garantia:', error)
      alert('Error al eliminar garantía')
    }
  }

  const filteredGarantias = garantias.filter(gar =>
    (gar.nombre_cliente && gar.nombre_cliente.toLowerCase().includes(search.toLowerCase())) ||
    (gar.documento && gar.documento.toString().includes(search)) ||
    (gar.referencia && gar.referencia.toLowerCase().includes(search.toLowerCase())) ||
    (gar.marca && gar.marca.toLowerCase().includes(search.toLowerCase()))
  )

  const getEstadoColor = (estado) => {
    const colors = {
      recibido: 'bg-blue-100 text-blue-800',
      en_revision: 'bg-yellow-100 text-yellow-800',
      reparado: 'bg-green-100 text-green-800',
      entregado: 'bg-gray-100 text-gray-800',
      sin_solucion: 'bg-red-100 text-red-800',
    }
    return colors[estado] || 'bg-gray-100 text-gray-800'
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
    return <div className="text-center">Cargando...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Garantías</h1>
          <p className="text-gray-600 mt-1">Gestiona los productos en garantía</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
          >
            <span className="text-xl">🏠</span>
            Inicio
          </button>
          <button
            onClick={() => router.push('/garantias/nueva')}
            className="btn-primary"
          >
            + Registrar Garantía
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <input
          type="text"
          placeholder="Buscar por cliente, documento, referencia o marca..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-blue-50">
          <h3 className="text-sm font-medium text-blue-800">Total Garantías</h3>
          <p className="text-2xl font-bold text-blue-900 mt-2">{garantias.length}</p>
        </div>
        <div className="card bg-yellow-50">
          <h3 className="text-sm font-medium text-yellow-800">En Revisión</h3>
          <p className="text-2xl font-bold text-yellow-900 mt-2">
            {garantias.filter(g => g.estado === 'en_revision').length}
          </p>
        </div>
        <div className="card bg-green-50">
          <h3 className="text-sm font-medium text-green-800">Reparados</h3>
          <p className="text-2xl font-bold text-green-900 mt-2">
            {garantias.filter(g => g.estado === 'reparado').length}
          </p>
        </div>
        <div className="card bg-gray-50">
          <h3 className="text-sm font-medium text-gray-800">Entregados</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {garantias.filter(g => g.estado === 'entregado').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        {filteredGarantias.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {search ? 'No se encontraron garantías' : 'No hay garantías registradas'}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">ID</th>
                <th className="text-left py-3 px-4">Fecha</th>
                <th className="text-left py-3 px-4">Cliente</th>
                <th className="text-left py-3 px-4">Documento</th>
                <th className="text-left py-3 px-4">Producto</th>
                <th className="text-left py-3 px-4">Marca</th>
                <th className="text-center py-3 px-4">Estado</th>
                <th className="text-right py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredGarantias.map((gar) => (
                <tr key={gar.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">#{gar.id}</td>
                  <td className="py-3 px-4">
                    {gar.created_at ? format(new Date(gar.created_at), 'dd/MM/yyyy') : '-'}
                  </td>
                  <td className="py-3 px-4">{gar.nombre_cliente}</td>
                  <td className="py-3 px-4">{gar.documento}</td>
                  <td className="py-3 px-4">{gar.referencia}</td>
                  <td className="py-3 px-4">{gar.marca}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(gar.estado)}`}>
                      {getEstadoLabel(gar.estado)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => router.push(`/garantias/${gar.id}`)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => handleDelete(gar.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
