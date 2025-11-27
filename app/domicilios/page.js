'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Domicilios() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [domicilios, setDomicilios] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editPrice, setEditPrice] = useState('')

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
    loadDomicilios()
  }, [router])

  const loadDomicilios = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('delivery_rates')
        .select('*')
        .order('neighborhood')

      if (error) throw error
      setDomicilios(data || [])
    } catch (error) {
      console.error('Error loading domicilios:', error)
      alert('Error al cargar domicilios')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, neighborhood) => {
    if (!confirm(`¿Eliminar el domicilio "${neighborhood}"?`)) return

    try {
      const { error } = await supabase
        .from('delivery_rates')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      alert('Domicilio eliminado')
      loadDomicilios()
    } catch (error) {
      console.error('Error deleting:', error)
      alert('Error al eliminar')
    }
  }

  const handleEdit = (id, currentPrice) => {
    setEditingId(id)
    setEditPrice(currentPrice)
  }

  const handleSaveEdit = async (id) => {
    try {
      const { error } = await supabase
        .from('delivery_rates')
        .update({ 
          price_cop: parseInt(editPrice),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error
      
      alert('Precio actualizado')
      setEditingId(null)
      setEditPrice('')
      loadDomicilios()
    } catch (error) {
      console.error('Error updating:', error)
      alert('Error al actualizar')
    }
  }

  const domiciliosFiltrados = domicilios.filter(d =>
    d.neighborhood.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (!user) {
    return <div className="text-center">Cargando...</div>
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">🚚 Domicilios</h1>
          <p className="text-gray-600 mt-1">
            Gestiona las tarifas de envío por barrio
          </p>
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
            onClick={() => router.push('/domicilios/nuevo')}
            className="btn-primary"
          >
            + Agregar Domicilio
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-sm opacity-90">Total Zonas</p>
          <p className="text-3xl font-bold mt-2">{domicilios.length}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-sm opacity-90">Tarifa Mínima</p>
          <p className="text-3xl font-bold mt-2">
            {domicilios.length > 0 ? formatPrice(Math.min(...domicilios.map(d => d.price_cop))) : '$0'}
          </p>
        </div>
        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <p className="text-sm opacity-90">Tarifa Máxima</p>
          <p className="text-3xl font-bold mt-2">
            {domicilios.length > 0 ? formatPrice(Math.max(...domicilios.map(d => d.price_cop))) : '$0'}
          </p>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <p className="text-sm opacity-90">Tarifa Promedio</p>
          <p className="text-3xl font-bold mt-2">
            {domicilios.length > 0 
              ? formatPrice(domicilios.reduce((sum, d) => sum + d.price_cop, 0) / domicilios.length)
              : '$0'}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Buscar por barrio, hotel o negocio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Cargando...</p>
          </div>
        ) : domiciliosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'No se encontraron resultados' : 'No hay domicilios registrados'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Barrio / Lugar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Domicilio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Actualización
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {domiciliosFiltrados.map((domicilio, index) => (
                  <tr key={domicilio.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {domicilio.neighborhood}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === domicilio.id ? (
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="input-field w-32"
                          autoFocus
                        />
                      ) : (
                        <span className="text-sm font-semibold text-green-600">
                          {formatPrice(domicilio.price_cop)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(domicilio.updated_at).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {editingId === domicilio.id ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(domicilio.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Guardar"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null)
                                setEditPrice('')
                              }}
                              className="text-gray-600 hover:text-gray-900"
                              title="Cancelar"
                            >
                              ✗
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(domicilio.id, domicilio.price_cop)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Editar precio"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(domicilio.id, domicilio.neighborhood)}
                              className="text-red-600 hover:text-red-900"
                              title="Eliminar"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="card bg-blue-50 border-l-4 border-blue-500">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-2xl">💡</span>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Tip:</strong> Puedes editar el precio directamente haciendo clic en el ícono ✏️. 
              Las tarifas se aplican automáticamente al crear cotizaciones con envío a domicilio.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
