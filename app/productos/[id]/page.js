'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

export default function DetalleProducto() {
  const params = useParams()
  const router = useRouter()
  const [producto, setProducto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    loadProducto()
  }, [params.id])

  const loadProducto = async () => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      
      if (!data) {
        alert('Producto no encontrado')
        router.push('/productos')
        return
      }

      setProducto(data)
    } catch (error) {
      console.error('Error loading producto:', error)
      alert('Error al cargar el producto')
      router.push('/productos')
    } finally {
      setLoading(false)
    }
  }

  const eliminarProducto = async () => {
    if (!confirm('¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      setDeleting(true)

      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', params.id)

      if (error) throw error

      alert('Producto eliminado correctamente')
      router.push('/productos')
    } catch (error) {
      console.error('Error deleting producto:', error)
      alert('Error al eliminar el producto')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Cargando producto...</div>
      </div>
    )
  }

  if (!producto) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Producto no encontrado</div>
      </div>
    )
  }

  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price || 0)
  }

  return (
    <div className="space-y-6">
      {/* Header con botones */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/productos')}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a Productos
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/productos/${params.id}/editar`)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
          >
            ✏️ Editar Producto
          </button>
          <button
            onClick={eliminarProducto}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? 'Eliminando...' : '🗑️ Eliminar'}
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Imagen */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Imagen del Producto</h3>
            <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
              {producto.imagen_url ? (
                <Image
                  src={producto.imagen_url}
                  alt={producto.nombre}
                  fill
                  className="object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="text-sm">Sin imagen</p>
                  </div>
                </div>
              )}
            </div>

            {/* Estado del producto */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Estado:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  producto.activo 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {producto.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Stock:</span>
                <span className={`px-3 py-1 rounded text-xs font-semibold ${
                  (producto.stock || producto.available_stock || 0) > 10
                    ? 'bg-green-100 text-green-800'
                    : (producto.stock || producto.available_stock || 0) > 0
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {producto.stock || producto.available_stock || 0} unidades
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha - Información */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información básica */}
          <div className="card">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {producto.nombre || 'Sin nombre'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Referencia: <span className="font-mono font-semibold">{producto.referencia || 'N/A'}</span>
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Precio de Venta</p>
                <p className="text-3xl font-bold text-blue-600">
                  {formatPrice(producto.precio_venta)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Marca</p>
                <p className="text-lg font-semibold text-gray-900">
                  {producto.marca || 'Sin marca'}
                </p>
              </div>
            </div>

            {producto.descripcion && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Descripción</h4>
                <p className="text-gray-600 whitespace-pre-wrap">{producto.descripcion}</p>
              </div>
            )}
          </div>

          {/* Detalles adicionales */}
          <div className="card">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Detalles Adicionales</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Categoría</p>
                <p className="font-semibold text-gray-900">{producto.categoria || 'N/A'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">IVA</p>
                <p className="font-semibold text-gray-900">{producto.iva || 0}%</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Garantía</p>
                <p className="font-semibold text-gray-900">{producto.warranty_months || 0} meses</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Stock Disponible</p>
                <p className="font-semibold text-gray-900">{producto.stock || producto.available_stock || 0}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">ID del Producto</p>
                <p className="font-semibold text-gray-900">#{producto.id}</p>
              </div>
            </div>
          </div>

          {/* Información del sistema */}
          <div className="card">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Información del Sistema</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Creado</p>
                <p className="font-medium">
                  {producto.created_at 
                    ? new Date(producto.created_at).toLocaleString('es-CO')
                    : 'N/A'
                  }
                </p>
              </div>
              <div>
                <p className="text-gray-500">Última Actualización</p>
                <p className="font-medium">
                  {producto.updated_at 
                    ? new Date(producto.updated_at).toLocaleString('es-CO')
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
