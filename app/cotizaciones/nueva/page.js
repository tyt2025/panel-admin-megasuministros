'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { normalizeText } from '@/lib/utils'

export default function NuevaCotizacion() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [clientes, setClientes] = useState([])
  const [productos, setProductos] = useState([])
  const [carrito, setCarrito] = useState([])
  const [searchProducto, setSearchProducto] = useState('')
  const [deliveryRates, setDeliveryRates] = useState([])
  const [incluirDomicilio, setIncluirDomicilio] = useState(false)
  const [searchBarrio, setSearchBarrio] = useState('')
  
  const [formData, setFormData] = useState({
    cliente_id: '',
    descuento: 0,
    iva: 0,  // IVA opcional - 0 para productos exentos, 19 para productos con IVA
    observaciones: '',
    validez_dias: 5,
    delivery_id: null,
    delivery_price: 0,
    nombre_vendedor: ''
  })
  
  // Estados para retenciones
  const [aplicarRetefuente, setAplicarRetefuente] = useState(false)
  const [retefuente, setRetefuente] = useState(2.5) // % por defecto
  const [aplicarReteiva, setAplicarReteiva] = useState(false)
  const [reteiva, setReteiva] = useState(15) // % por defecto
  const [aplicarIca, setAplicarIca] = useState(false)
  const [ica, setIca] = useState(0.966) // % por defecto
  const [aplicarReteica, setAplicarReteica] = useState(false)
  const [reteica, setReteica] = useState(0.966) // % por defecto

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
    loadData(JSON.parse(userData))
  }, [router])

  const loadData = async (userData) => {
    try {
      const [clientesRes, productosRes, deliveryRes] = await Promise.all([
        supabase
          .from('clientes')
          .select('*')
          .eq('vendedor_id', userData.vendedor_id)
          .order('nombre'),
        supabase
          .from('productos')
          .select('*'),
        supabase
          .from('delivery_rates')
          .select('*')
          .order('neighborhood')
      ])

      // Ordenar productos por nombre en JavaScript (después de cargar TODOS)
      // Megasuministros usa 'nombre' en lugar de 'product_name'
      const productosOrdenados = (productosRes.data || []).sort((a, b) => {
        const nameA = (a.nombre || a.product_name || '').toLowerCase()
        const nameB = (b.nombre || b.product_name || '').toLowerCase()
        return nameA.localeCompare(nameB)
      })

      console.log('📦 Productos cargados:', productosOrdenados.length)
      console.log('📦 Primeros 3 productos:', productosOrdenados.slice(0, 3).map(p => ({id: p.id, name: p.nombre || p.product_name, sku: p.referencia || p.sku})))
      console.log('📦 Últimos 3 productos:', productosOrdenados.slice(-3).map(p => ({id: p.id, name: p.nombre || p.product_name, sku: p.referencia || p.sku})))
      
      setClientes(clientesRes.data || [])
      setProductos(productosOrdenados)
      setDeliveryRates(deliveryRes.data || [])
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const agregarAlCarrito = (producto) => {
    const existente = carrito.find(item => item.producto_id === producto.id)
    if (existente) {
      setCarrito(carrito.map(item =>
        item.producto_id === producto.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ))
    } else {
      setCarrito([...carrito, {
        producto_id: producto.id,
        // Megasuministros usa: nombre, referencia, precio_venta
        nombre: producto.nombre || producto.product_name || producto.name,
        sku: producto.referencia || producto.sku || '',
        precio_unitario: producto.precio_venta || producto.price_cop || producto.price || 0,
        cantidad: 1
      }])
    }
    setSearchProducto('')
  }

  const actualizarCantidad = (producto_id, cantidad) => {
    if (cantidad <= 0) {
      setCarrito(carrito.filter(item => item.producto_id !== producto_id))
    } else {
      setCarrito(carrito.map(item =>
        item.producto_id === producto_id
          ? { ...item, cantidad: parseInt(cantidad) }
          : item
      ))
    }
  }

  const actualizarPrecio = (producto_id, precio) => {
    setCarrito(carrito.map(item =>
      item.producto_id === producto_id
        ? { ...item, precio_unitario: parseFloat(precio) || 0 }
        : item
    ))
  }

  const eliminarDelCarrito = (producto_id) => {
    setCarrito(carrito.filter(item => item.producto_id !== producto_id))
  }

  const calcularTotales = () => {
    const subtotal = carrito.reduce((sum, item) => 
      sum + (item.precio_unitario * item.cantidad), 0)
    
    // Calcular IVA si está configurado
    let baseImponible = subtotal
    let ivaMonto = 0
    
    if (formData.iva > 0) {
      // Si hay IVA, el subtotal ya incluye el IVA
      // Base imponible = Subtotal / (1 + IVA%)
      baseImponible = subtotal / (1 + (formData.iva / 100))
      // Monto IVA = Subtotal - Base imponible
      ivaMonto = subtotal - baseImponible
    }
    
    const descuentoMonto = subtotal * (formData.descuento / 100)
    const subtotalConDescuento = subtotal - descuentoMonto
    const domicilio = incluirDomicilio ? formData.delivery_price : 0
    
    // Calcular retenciones (se aplican sobre el subtotal con descuento)
    const montoRetefuente = aplicarRetefuente ? (subtotalConDescuento * retefuente / 100) : 0
    const montoReteiva = aplicarReteiva && ivaMonto > 0 ? (ivaMonto * reteiva / 100) : 0
    const montoIca = aplicarIca ? (subtotalConDescuento * ica / 100) : 0
    const montoReteica = aplicarReteica ? (subtotalConDescuento * reteica / 100) : 0
    
    // Total de retenciones
    const totalRetenciones = montoRetefuente + montoReteiva + montoIca + montoReteica
    
    // Total final (subtotal + domicilio - retenciones)
    const total = subtotalConDescuento + domicilio - totalRetenciones

    return { 
      subtotal, 
      descuentoMonto, 
      baseImponible, 
      ivaMonto, 
      domicilio, 
      montoRetefuente,
      montoReteiva,
      montoIca,
      montoReteica,
      totalRetenciones,
      total,
      subtotalConDescuento 
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (carrito.length === 0) {
      alert('Agrega al menos un producto')
      return
    }

    if (!formData.cliente_id) {
      alert('Selecciona un cliente')
      return
    }

    setLoading(true)

    try {
      const totales = calcularTotales()

      // Obtener datos del cliente seleccionado
      const clienteSeleccionado = clientes.find(c => c.id.toString() === formData.cliente_id.toString())

      // Datos de cotización con todas las columnas que existen en la tabla
      const cotizacionData = {
        // Campos NOT NULL (obligatorios)
        subtotal: Math.round(totales.subtotal),
        iva: parseFloat(formData.iva) || 0,  // Sin Math.round para mantener decimales
        total: Math.round(totales.total),
        
        // Campos opcionales pero útiles
        cliente_id: parseInt(formData.cliente_id) || null,
        vendedor_id: user.vendedor_id,
        nombre_cliente: clienteSeleccionado?.nombre || '',
        nit_cliente: clienteSeleccionado?.nit || '',
        telefono_cliente: clienteSeleccionado?.telefono || '',
        email_cliente: clienteSeleccionado?.email || '',
        direccion_cliente: clienteSeleccionado?.direccion || '',
        ciudad_cliente: clienteSeleccionado?.ciudad || '',
        estado: 'pendiente',
        descuento: parseFloat(formData.descuento) || 0,
        validez_dias: parseInt(formData.validez_dias) || 5,
        nombre_vendedor: formData.nombre_vendedor || '',
        observaciones: formData.observaciones || '',
        
        // Retenciones (porcentajes y montos calculados)
        retefuente: aplicarRetefuente ? parseFloat(retefuente) : 0,
        reteiva: aplicarReteiva ? parseFloat(reteiva) : 0,
        ica: aplicarIca ? parseFloat(ica) : 0,
        reteica: aplicarReteica ? parseFloat(reteica) : 0,
        monto_retefuente: Math.round(totales.montoRetefuente) || 0,
        monto_reteiva: Math.round(totales.montoReteiva) || 0,
        monto_ica: Math.round(totales.montoIca) || 0,
        monto_reteica: Math.round(totales.montoReteica) || 0
      }

      console.log('📝 Creando cotización con datos:', cotizacionData)

      // Crear cotización
      const { data: cotizacion, error: cotError} = await supabase
        .from('cotizaciones')
        .insert([cotizacionData])
        .select()
        .single()

      if (cotError) {
        console.error('❌ Error al crear cotización:', cotError)
        alert('Error al crear cotización: ' + (cotError.message || JSON.stringify(cotError)))
        setLoading(false)
        return
      }

      console.log('✅ Cotización creada:', cotizacion)

      // Crear items
      const items = carrito.map(item => ({
        cotizacion_id: cotizacion.id,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.precio_unitario * item.cantidad
      }))

      const { error: itemsError } = await supabase
        .from('cotizacion_items')
        .insert(items)

      if (itemsError) throw itemsError

      alert('Cotización creada exitosamente')
      router.push(`/cotizaciones/${cotizacion.id}`)
    } catch (error) {
      console.error('Error creating cotizacion:', error)
      alert('Error al crear cotización')
    } finally {
      setLoading(false)
    }
  }

  const productosFiltrados = productos.filter(p => {
    const searchNormalized = normalizeText(searchProducto)
    // Megasuministros usa: nombre, referencia (en lugar de product_name, sku)
    const nombreNormalized = normalizeText(p.nombre || p.product_name || p.name || '')
    const skuNormalized = normalizeText(p.referencia || p.sku || '')
    return nombreNormalized.includes(searchNormalized) || skuNormalized.includes(searchNormalized)
  }).slice(0, 10)

  const totales = calcularTotales()

  if (!user) {
    return <div className="text-center">Cargando...</div>
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Nueva Cotización</h1>
        <button onClick={() => router.back()} className="btn-secondary">
          Volver
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cliente */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">1. Datos del Cliente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente *
              </label>
              <select
                value={formData.cliente_id}
                onChange={(e) => setFormData({...formData, cliente_id: e.target.value})}
                className="input-field"
                required
              >
                <option value="">Selecciona un cliente</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Validez (días)
              </label>
              <input
                type="number"
                value={formData.validez_dias}
                onChange={(e) => setFormData({...formData, validez_dias: e.target.value})}
                className="input-field"
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Productos */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">2. Productos</h3>
          
          {/* Buscar producto */}
          <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar producto por nombre o SKU
              <span className="ml-2 text-xs text-green-600 font-normal">
                ({productos.length} productos disponibles)
              </span>
            </label>
            <input
              type="text"
              placeholder="Escribe el nombre o SKU del producto..."
              value={searchProducto}
              onChange={(e) => setSearchProducto(e.target.value)}
              className="input-field"
            />
            {searchProducto && productosFiltrados.length > 0 && (
              <div className="absolute z-10 w-full bg-white border rounded-lg shadow-xl mt-1 max-h-96 overflow-y-auto">
                {productosFiltrados.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => agregarAlCarrito(p)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {/* Imagen del producto */}
                      <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                        {(p.imagen_url || p.image_url_png || p.main_image_url) ? (
                          <img
                            src={p.imagen_url || p.image_url_png || p.main_image_url}
                            alt={p.nombre || p.product_name || p.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      {/* Información del producto */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 truncate">
                          {p.nombre || p.product_name || p.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Ref: {p.referencia || p.sku}
                        </div>
                        {(p.marca || p.brand) && (
                          <div className="text-xs text-gray-600 mt-0.5">
                            {p.marca || p.brand}
                          </div>
                        )}
                        <div className="text-sm font-semibold text-blue-600 mt-1">
                          ${(p.precio_venta || p.price_cop || p.price || 0).toLocaleString('es-CO')}
                        </div>
                      </div>

                      {/* Stock */}
                      <div className="flex-shrink-0">
                        <span className={`text-xs px-2 py-1 rounded ${
                          (p.available_stock || p.stock || 0) > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          Stock: {p.available_stock || p.stock || 0}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {searchProducto && productosFiltrados.length === 0 && (
              <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 p-4 text-center text-gray-500">
                No se encontraron productos
              </div>
            )}
          </div>

          {/* Carrito */}
          {carrito.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay productos agregados
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Producto</th>
                    <th className="text-center py-2 px-2">Cantidad</th>
                    <th className="text-right py-2 px-2">Precio Unit.</th>
                    <th className="text-right py-2 px-2">Subtotal</th>
                    <th className="text-center py-2 px-2">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {carrito.map(item => (
                    <tr key={item.producto_id} className="border-b">
                      <td className="py-2 px-2">{item.nombre}</td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          value={item.cantidad}
                          onChange={(e) => actualizarCantidad(item.producto_id, e.target.value)}
                          className="w-20 px-2 py-1 border rounded text-center"
                          min="1"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          value={item.precio_unitario}
                          onChange={(e) => actualizarPrecio(item.producto_id, e.target.value)}
                          className="w-32 px-2 py-1 border rounded text-right"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="py-2 px-2 text-right font-medium">
                        ${(item.precio_unitario * item.cantidad).toLocaleString('es-CO')}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => eliminarDelCarrito(item.producto_id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Domicilio (Opcional) */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">3. Envío a Domicilio (Opcional)</h3>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={incluirDomicilio}
                onChange={(e) => {
                  setIncluirDomicilio(e.target.checked)
                  if (!e.target.checked) {
                    setFormData({
                      ...formData,
                      delivery_id: null,
                      delivery_price: 0
                    })
                    setSearchBarrio('')
                  }
                }}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                ¿Incluir envío a domicilio?
              </span>
            </label>
          </div>

          {incluirDomicilio && (
            <div className="space-y-4 pt-4 border-t">
              {/* Buscador de barrio */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecciona el barrio/zona de entrega
                </label>
                <input
                  type="text"
                  placeholder="🔍 Buscar barrio, hotel o negocio..."
                  value={searchBarrio}
                  onChange={(e) => setSearchBarrio(e.target.value)}
                  className="input-field"
                />
                
                {searchBarrio && (
                  <div className="absolute z-10 w-full bg-white border rounded-lg shadow-xl mt-1 max-h-64 overflow-y-auto">
                    {deliveryRates
                      .filter(d => 
                        d.neighborhood.toLowerCase().includes(searchBarrio.toLowerCase())
                      )
                      .slice(0, 20)
                      .map(delivery => (
                        <button
                          key={delivery.id}
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              delivery_id: delivery.id,
                              delivery_price: delivery.price_cop
                            })
                            setSearchBarrio(delivery.neighborhood)
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-blue-50 border-b last:border-b-0 transition-colors ${
                            formData.delivery_id === delivery.id ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-gray-900">
                                {delivery.neighborhood}
                              </div>
                            </div>
                            <div className="text-green-600 font-semibold">
                              ${delivery.price_cop.toLocaleString('es-CO')}
                            </div>
                          </div>
                        </button>
                      ))}
                    {deliveryRates.filter(d => 
                      d.neighborhood.toLowerCase().includes(searchBarrio.toLowerCase())
                    ).length === 0 && (
                      <div className="p-4 text-center text-gray-500">
                        No se encontró ese barrio. <br/>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('¿Deseas ir al módulo de Domicilios para agregarlo?')) {
                              router.push('/domicilios/nuevo')
                            }
                          }}
                          className="text-blue-600 underline mt-2"
                        >
                          Agregar nuevo domicilio
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Zona seleccionada */}
              {formData.delivery_id && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700 font-medium">
                        🚚 Zona seleccionada:
                      </p>
                      <p className="text-lg font-bold text-green-900 mt-1">
                        {searchBarrio}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-700">Costo de envío</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${formData.delivery_price.toLocaleString('es-CO')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Totales */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">{incluirDomicilio ? '4' : '3'}. Totales y Retenciones</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descuento (%)
              </label>
              <input
                type="number"
                value={formData.descuento}
                onChange={(e) => setFormData({...formData, descuento: parseFloat(e.target.value) || 0})}
                className="input-field"
                min="0"
                max="100"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IVA (%) <span className="text-xs text-gray-500">- 0 para productos exentos, 19 para productos con IVA</span>
              </label>
              <input
                type="number"
                value={formData.iva}
                onChange={(e) => setFormData({...formData, iva: parseFloat(e.target.value) || 0})}
                className="input-field"
                min="0"
                max="100"
                step="0.01"
                placeholder="0 (sin IVA) o 19 (con IVA)"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Tablets y computadores: 0% | Otros productos: 19%
              </p>
            </div>
          </div>

          {/* Sección de Retenciones */}
          <div className="border-t pt-4 mb-4">
            <h4 className="text-md font-semibold mb-3 text-gray-800">💼 Retenciones (Opcionales)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Retefuente */}
              <div className="border rounded-lg p-3 bg-orange-50">
                <label className="flex items-center cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={aplicarRetefuente}
                    onChange={(e) => setAplicarRetefuente(e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded mr-2"
                  />
                  <span className="text-sm font-medium text-gray-800">Retención en la Fuente</span>
                </label>
                {aplicarRetefuente && (
                  <input
                    type="number"
                    value={retefuente}
                    onChange={(e) => setRetefuente(parseFloat(e.target.value) || 0)}
                    className="input-field text-sm"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="% Retefuente"
                  />
                )}
              </div>

              {/* ReteIVA */}
              <div className="border rounded-lg p-3 bg-blue-50">
                <label className="flex items-center cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={aplicarReteiva}
                    onChange={(e) => setAplicarReteiva(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded mr-2"
                  />
                  <span className="text-sm font-medium text-gray-800">Retención de IVA</span>
                </label>
                {aplicarReteiva && (
                  <input
                    type="number"
                    value={reteiva}
                    onChange={(e) => setReteiva(parseFloat(e.target.value) || 0)}
                    className="input-field text-sm"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="% ReteIVA"
                  />
                )}
              </div>

              {/* ICA */}
              <div className="border rounded-lg p-3 bg-purple-50">
                <label className="flex items-center cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={aplicarIca}
                    onChange={(e) => setAplicarIca(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded mr-2"
                  />
                  <span className="text-sm font-medium text-gray-800">ICA</span>
                </label>
                {aplicarIca && (
                  <input
                    type="number"
                    value={ica}
                    onChange={(e) => setIca(parseFloat(e.target.value) || 0)}
                    className="input-field text-sm"
                    min="0"
                    max="10"
                    step="0.001"
                    placeholder="% ICA"
                  />
                )}
              </div>

              {/* ReteICA */}
              <div className="border rounded-lg p-3 bg-green-50">
                <label className="flex items-center cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={aplicarReteica}
                    onChange={(e) => setAplicarReteica(e.target.checked)}
                    className="w-4 h-4 text-green-600 rounded mr-2"
                  />
                  <span className="text-sm font-medium text-gray-800">Retención de ICA</span>
                </label>
                {aplicarReteica && (
                  <input
                    type="number"
                    value={reteica}
                    onChange={(e) => setReteica(parseFloat(e.target.value) || 0)}
                    className="input-field text-sm"
                    min="0"
                    max="10"
                    step="0.001"
                    placeholder="% ReteICA"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            {formData.iva > 0 ? (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal (Base):</span>
                  <span className="font-medium">${totales.baseImponible.toLocaleString('es-CO', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">IVA ({formData.iva}%):</span>
                  <span className="font-medium">${totales.ivaMonto.toLocaleString('es-CO', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span className="text-gray-700">Subtotal (con IVA):</span>
                  <span>${totales.subtotal.toLocaleString('es-CO')}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${totales.subtotal.toLocaleString('es-CO')}</span>
              </div>
            )}
            {formData.descuento > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Descuento ({formData.descuento}%):</span>
                <span>-${totales.descuentoMonto.toLocaleString('es-CO')}</span>
              </div>
            )}
            {incluirDomicilio && formData.delivery_price > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Envío a domicilio:</span>
                <span>+${totales.domicilio.toLocaleString('es-CO')}</span>
              </div>
            )}
            
            {/* Mostrar retenciones aplicadas */}
            {(aplicarRetefuente || aplicarReteiva || aplicarIca || aplicarReteica) && (
              <div className="border-t pt-2 mt-2">
                <div className="text-sm font-semibold text-gray-700 mb-1">Retenciones:</div>
                {aplicarRetefuente && totales.montoRetefuente > 0 && (
                  <div className="flex justify-between text-orange-600 text-sm">
                    <span>Retefuente ({retefuente}%):</span>
                    <span>-${totales.montoRetefuente.toLocaleString('es-CO')}</span>
                  </div>
                )}
                {aplicarReteiva && totales.montoReteiva > 0 && (
                  <div className="flex justify-between text-blue-600 text-sm">
                    <span>ReteIVA ({reteiva}%):</span>
                    <span>-${totales.montoReteiva.toLocaleString('es-CO')}</span>
                  </div>
                )}
                {aplicarIca && totales.montoIca > 0 && (
                  <div className="flex justify-between text-purple-600 text-sm">
                    <span>ICA ({ica}%):</span>
                    <span>-${totales.montoIca.toLocaleString('es-CO')}</span>
                  </div>
                )}
                {aplicarReteica && totales.montoReteica > 0 && (
                  <div className="flex justify-between text-green-600 text-sm">
                    <span>ReteICA ({reteica}%):</span>
                    <span>-${totales.montoReteica.toLocaleString('es-CO')}</span>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex justify-between text-xl font-bold border-t pt-2">
              <span>Total a Pagar:</span>
              <span>${totales.total.toLocaleString('es-CO')}</span>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Vendedor
            </label>
            <input
              type="text"
              value={formData.nombre_vendedor}
              onChange={(e) => setFormData({...formData, nombre_vendedor: e.target.value})}
              className="input-field"
              placeholder="Ingresa el nombre del vendedor"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
              className="input-field"
              rows="3"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || carrito.length === 0}
            className="flex-1 btn-primary disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Crear Cotización'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
