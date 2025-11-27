'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

export default function EditarProducto() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [categorias, setCategorias] = useState([])
  const [subcategorias, setSubcategorias] = useState([])
  const [subcategoriasFiltradas, setSubcategoriasFiltradas] = useState([])
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const [formData, setFormData] = useState({
    // Megasuministros usa: referencia, nombre, precio_venta, imagen_url
    referencia: '',
    nombre: '',
    categoria: '',
    descripcion: '',
    precio_venta: '',
    precio_costo: '',
    marca: '',
    imagen_url: '',
    stock: 0,
    available_stock: 0,
    warranty_months: 0,
    activo: true,
    iva: 19
  })

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    loadData()
  }, [params.id])

  const loadData = async () => {
    try {
      setLoadingData(true)
      
      // Cargar categorías, subcategorías y producto
      const [catRes, subRes, prodRes] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('subcategories').select('*').order('name'),
        supabase
          .from('productos')
          .select('*')
          .eq('id', params.id)
          .single()
      ])

      setCategorias(catRes.data || [])
      setSubcategorias(subRes.data || [])

      if (prodRes.error) throw prodRes.error
      
      if (!prodRes.data) {
        alert('Producto no encontrado')
        router.push('/productos')
        return
      }

      // Cargar datos del producto en el formulario
      // Megasuministros usa: referencia, nombre, precio_venta, imagen_url, etc.
      const producto = prodRes.data
      setFormData({
        referencia: producto.referencia || '',
        nombre: producto.nombre || '',
        categoria: producto.categoria || '',
        descripcion: producto.descripcion || '',
        precio_venta: producto.precio_venta || '',
        precio_costo: producto.precio_costo || '',
        marca: producto.marca || '',
        imagen_url: producto.imagen_url || '',
        stock: producto.stock || 0,
        available_stock: producto.available_stock || 0,
        warranty_months: producto.warranty_months || 0,
        activo: producto.activo !== undefined ? producto.activo : true,
        iva: producto.iva || 19
      })

      // Establecer preview de imagen actual
      if (producto.imagen_url) {
        setImagePreview(producto.imagen_url)
      }

      // Filtrar subcategorías si hay categoría seleccionada
      if (producto.category_id) {
        const filtered = (subRes.data || []).filter(
          sub => sub.category_id === parseInt(producto.category_id)
        )
        setSubcategoriasFiltradas(filtered)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Error al cargar los datos')
      router.push('/productos')
    } finally {
      setLoadingData(false)
    }
  }

  const handleCategoryChange = (categoryId) => {
    setFormData({ ...formData, category_id: categoryId, subcategory_id: '' })
    
    // Filtrar subcategorías por categoría
    const filtered = subcategorias.filter(sub => sub.category_id === parseInt(categoryId))
    setSubcategoriasFiltradas(filtered)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido')
        return
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB')
        return
      }

      setImageFile(file)
      
      // Crear preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async () => {
    if (!imageFile) return null

    try {
      setUploading(true)
      
      // Generar nombre único para la imagen
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `PRODUCTOS_IMAGENES/${fileName}`

      console.log('🔄 Subiendo imagen:', { 
        fileName, 
        filePath, 
        bucket: 'productos-imgs',
        size: `${(imageFile.size / 1024 / 1024).toFixed(2)}MB`
      })

      // Subir imagen a Supabase Storage
      const { data, error } = await supabase.storage
        .from('productos-imgs')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('❌ Error en upload:', error)
        throw error
      }

      console.log('✅ Imagen subida exitosamente:', data)

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('productos-imgs')
        .getPublicUrl(filePath)

      console.log('🔗 URL pública generada:', publicUrl)

      return publicUrl
    } catch (error) {
      console.error('❌ Error uploading image:', error)
      alert('Error al subir la imagen: ' + error.message)
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validar campos obligatorios de Megasuministros
    if (!formData.nombre) {
      alert('⚠️ Por favor ingresa el nombre del producto')
      return
    }
    
    setLoading(true)

    try {
      // Subir imagen si hay una nueva seleccionada
      let imageUrl = formData.imagen_url
      if (imageFile) {
        console.log('📤 Iniciando subida de nueva imagen...')
        imageUrl = await uploadImage()
        if (!imageUrl) {
          console.error('❌ No se obtuvo URL de la imagen')
          setLoading(false)
          return
        }
        console.log('✅ Imagen subida con URL:', imageUrl)
      }

      // Megasuministros usa columnas diferentes
      const productData = {
        referencia: formData.referencia,
        nombre: formData.nombre,
        categoria: formData.categoria,
        descripcion: formData.descripcion,
        precio_venta: parseFloat(formData.precio_venta) || 0,
        precio_costo: parseFloat(formData.precio_costo) || 0,
        marca: formData.marca,
        imagen_url: imageUrl,
        stock: parseInt(formData.stock) || 0,
        available_stock: parseInt(formData.available_stock) || 0,
        warranty_months: parseInt(formData.warranty_months) || 0,
        activo: formData.activo,
        iva: parseFloat(formData.iva) || 19,
        updated_at: new Date().toISOString()
      }

      console.log('💾 Actualizando producto con datos:', productData)

      const { data, error } = await supabase
        .from('productos')
        .update(productData)
        .eq('id', params.id)
        .select()

      if (error) {
        console.error('❌ Error al actualizar en DB:', error)
        throw error
      }

      console.log('✅ Producto actualizado exitosamente:', data)
      alert('✅ Producto actualizado exitosamente')
      router.push(`/productos/${params.id}`)
    } catch (error) {
      console.error('❌ Error updating producto:', error)
      alert('❌ Error al actualizar producto: ' + (error.message || JSON.stringify(error)))
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Cargando datos...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Editar Producto</h1>
        <div className="flex gap-3">
          <button 
            onClick={() => router.push(`/productos/${params.id}`)} 
            className="btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Información Básica</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referencia *
              </label>
              <input
                type="text"
                value={formData.referencia}
                onChange={(e) => setFormData({...formData, referencia: e.target.value})}
                className="input-field"
                required
                placeholder="Ej: 6574475"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Producto *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                className="input-field"
                required
                placeholder="Ej: Impresora HP M141W"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Seleccionar categoría</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategoría
              </label>
              <select
                value={formData.subcategory_id}
                onChange={(e) => setFormData({...formData, subcategory_id: e.target.value})}
                className="input-field"
                disabled={!formData.category_id}
              >
                <option value="">Seleccionar subcategoría</option>
                {subcategoriasFiltradas.map(sub => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marca
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                className="input-field"
                placeholder="Ej: Logitech"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio (COP) *
              </label>
              <input
                type="number"
                value={formData.price_cop}
                onChange={(e) => setFormData({...formData, price_cop: e.target.value})}
                className="input-field"
                required
                min="0"
                step="0.01"
                placeholder="Ej: 50000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Disponible
              </label>
              <input
                type="number"
                value={formData.available_stock}
                onChange={(e) => setFormData({...formData, available_stock: e.target.value})}
                className="input-field"
                min="0"
                placeholder="Ej: 100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Garantía (meses)
              </label>
              <input
                type="number"
                value={formData.warranty_months}
                onChange={(e) => setFormData({...formData, warranty_months: e.target.value})}
                className="input-field"
                min="0"
                placeholder="Ej: 12"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción Corta
            </label>
            <input
              type="text"
              value={formData.short_description}
              onChange={(e) => setFormData({...formData, short_description: e.target.value})}
              className="input-field"
              placeholder="Descripción breve del producto"
              maxLength="200"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.short_description.length}/200 caracteres
            </p>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción Completa
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="input-field"
              rows="6"
              placeholder="Descripción detallada del producto..."
            />
          </div>
        </div>

        {/* Imagen */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Imagen del Producto</h3>
          
          {imagePreview && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
              <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {imagePreview ? 'Cambiar imagen' : 'Subir imagen'}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              Formatos: JPG, PNG, WEBP, GIF • Tamaño máximo: 5MB
            </p>
          </div>
        </div>

        {/* Estado */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Estado del Producto</h3>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                Producto activo (visible para los vendedores)
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_featured"
                checked={formData.is_featured}
                onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="is_featured" className="ml-2 text-sm text-gray-700">
                Producto destacado
              </label>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="card">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push(`/productos/${params.id}`)}
              className="btn-secondary"
              disabled={loading || uploading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : uploading ? 'Subiendo imagen...' : '💾 Guardar Cambios'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
