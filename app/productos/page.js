'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

export default function ProductosPage() {
  const router = useRouter()
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const productosPorPagina = 20

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    loadProductos()
  }, [router])

  const loadProductos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('productos')
        .select('*')

      if (error) throw error
      
      // Ordenar productos por nombre en JavaScript (después de cargar TODOS)
      // Megasuministros usa 'nombre' en lugar de 'product_name'
      const productosOrdenados = (data || []).sort((a, b) => {
        const nameA = (a.nombre || a.product_name || '').toLowerCase()
        const nameB = (b.nombre || b.product_name || '').toLowerCase()
        return nameA.localeCompare(nameB)
      })
      
      console.log('📦 Total productos cargados:', productosOrdenados.length)
      console.log('📦 Últimos 5 IDs:', productosOrdenados.slice(-5).map(p => p.id))
      
      setProductos(productosOrdenados)
    } catch (error) {
      console.error('Error loading productos:', error)
      alert('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  // Filtrar productos por búsqueda (nombre o SKU/Referencia)
  const productosFiltrados = productos.filter(p => {
    const searchLower = searchTerm.toLowerCase()
    // Megasuministros usa: nombre, referencia
    const nombre = (p.nombre || p.product_name || '').toLowerCase()
    const sku = (p.referencia || p.sku || '').toLowerCase()
    return nombre.includes(searchLower) || sku.includes(searchLower)
  })

  // Paginación
  const indexOfLastProducto = currentPage * productosPorPagina
  const indexOfFirstProducto = indexOfLastProducto - productosPorPagina
  const productosActuales = productosFiltrados.slice(indexOfFirstProducto, indexOfLastProducto)
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Cargando productos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Productos</h1>
          <p className="text-gray-600 mt-1">
            {productosFiltrados.length} productos encontrados
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
            onClick={() => router.push('/productos/nuevo')}
            className="btn-primary"
          >
            + Nuevo Producto
          </button>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="card">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1) // Reset a primera página al buscar
            }}
            className="input-field pl-10"
          />
          <svg
            className="absolute left-3 top-3 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Lista de productos */}
      {productosActuales.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">No se encontraron productos</p>
          {searchTerm && (
            <p className="text-gray-400 mt-2">
              Intenta con otra búsqueda
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {productosActuales.map((producto) => (
              <div
                key={producto.id}
                className="card hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/productos/${producto.id}`)}
              >
                {/* Imagen del producto */}
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-3">
                  {producto.imagen_url || producto.image_url_png || producto.main_image_url ? (
                    <Image
                      src={producto.imagen_url || producto.image_url_png || producto.main_image_url}
                      alt={producto.nombre || producto.product_name}
                      fill
                      className="object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Información del producto */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                    {producto.nombre || producto.product_name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">
                    Ref: {producto.referencia || producto.sku}
                  </p>
                  {(producto.marca || producto.brand) && (
                    <p className="text-xs text-gray-600 mb-2">
                      Marca: {producto.marca || producto.brand}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-blue-600">
                      ${(producto.precio_venta || producto.price_cop || producto.price || 0).toLocaleString('es-CO')}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      (producto.available_stock || producto.stock || 0) > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      Stock: {producto.available_stock || producto.stock || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="card">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Anterior
                </button>
                <span className="text-gray-600">
                  Página {currentPage} de {totalPaginas}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPaginas))}
                  disabled={currentPage === totalPaginas}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
