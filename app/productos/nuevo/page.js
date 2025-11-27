'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { Plus, X } from 'lucide-react'

export default function NuevoProducto() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [categorias, setCategorias] = useState([])
  const [subcategorias, setSubcategorias] = useState([])
  const [subcategoriasFiltradas, setSubcategoriasFiltradas] = useState([])
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  
  // Estados para modales
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newSubcategoryName, setNewSubcategoryName] = useState('')
  const [savingCategory, setSavingCategory] = useState(false)

  // Estado del formulario - Ajustado a tu tabla productos
  const [formData, setFormData] = useState({
    referencia: '',
    nombre: '',
    marca: '',
    categoria: '',
    subcategoria: '',
    precio_venta: '',
    iva: 19,
    stock: 0,
    descripcion: '',
    available_stock: 0,
    warranty_months: 0
  })

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    loadCategorias()
  }, [router])

  const loadCategorias = async () => {
    try {
      const [catRes, subRes] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('subcategories').select('*').order('name')
      ])

      setCategorias(catRes.data || [])
      setSubcategorias(subRes.data || [])
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const handleCategoryChange = (categoryName) => {
    setFormData({ ...formData, categoria: categoryName, subcategoria: '' })
    
    // Buscar el ID de la categoría seleccionada
    const selectedCat = categorias.find(cat => cat.name === categoryName)
    if (selectedCat) {
      const filtered = subcategorias.filter(sub => sub.category_id === selectedCat.id)
      setSubcategoriasFiltradas(filtered)
    } else {
      setSubcategoriasFiltradas([])
    }
  }

  const createCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Por favor ingresa un nombre para la categoría')
      return
    }

    try {
      setSavingCategory(true)
      
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: newCategoryName.trim() }])
        .select()

      if (error) throw error

      const newCategory = data[0]
      setCategorias([...categorias, newCategory])
      setFormData({ ...formData, categoria: newCategory.name, subcategoria: '' })
      setSubcategoriasFiltradas([])
      
      setShowCategoryModal(false)
      setNewCategoryName('')
      
      alert('✅ Categoría creada exitosamente')
    } catch (error) {
      console.error('Error creating category:', error)
      alert('Error al crear la categoría')
    } finally {
      setSavingCategory(false)
    }
  }

  const createSubcategory = async () => {
    if (!formData.categoria) {
      alert('Primero debes seleccionar una categoría')
      return
    }

    if (!newSubcategoryName.trim()) {
      alert('Por favor ingresa un nombre para la subcategoría')
      return
    }

    try {
      setSavingCategory(true)
      
      // Buscar el ID de la categoría actual
      const selectedCat = categorias.find(cat => cat.name === formData.categoria)
      if (!selectedCat) {
        alert('Error: categoría no encontrada')
        return
      }

      const { data, error } = await supabase
        .from('subcategories')
        .insert([{ 
          name: newSubcategoryName.trim(),
          category_id: selectedCat.id
        }])
        .select()

      if (error) throw error

      const newSubcategory = data[0]
      setSubcategorias([...subcategorias, newSubcategory])
      setSubcategoriasFiltradas([...subcategoriasFiltradas, newSubcategory])
      setFormData({ ...formData, subcategoria: newSubcategory.name })
      
      setShowSubcategoryModal(false)
      setNewSubcategoryName('')
      
      alert('✅ Subcategoría creada exitosamente')
    } catch (error) {
      console.error('Error creating subcategory:', error)
      alert('Error al crear la subcategoría')
    } finally {
      setSavingCategory(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB')
        return
      }

      setImageFile(file)
      
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
      
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `PRODUCTOS_IMAGENES/${fileName}`

      console.log('🔄 Subiendo imagen:', { fileName, filePath })

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
    
    // Validaciones
    if (!formData.referencia.trim()) {
      alert('⚠️ La referencia es obligatoria')
      return
    }
    if (!formData.nombre.trim()) {
      alert('⚠️ El nombre es obligatorio')
      return
    }
    if (!formData.marca.trim()) {
      alert('⚠️ La marca es obligatoria')
      return
    }
    
    setLoading(true)

    try {
      // Subir imagen si hay una seleccionada
      let imageUrl = null
      if (imageFile) {
        console.log('📤 Iniciando subida de imagen...')
        imageUrl = await uploadImage()
        if (!imageUrl) {
          console.error('❌ No se obtuvo URL de la imagen')
          setLoading(false)
          return
        }
        console.log('✅ Imagen subida con URL:', imageUrl)
      }

      // Datos del producto - Ajustados a tu tabla
      const productData = {
        referencia: formData.referencia.trim(),
        nombre: formData.nombre.trim(),
        marca: formData.marca.trim(),
        categoria: formData.categoria || null,
        precio_venta: parseInt(formData.precio_venta) || 0,
        iva: parseFloat(formData.iva) || 19,
        stock: parseInt(formData.stock) || 0,
        activo: true,
        imagen_url: imageUrl,
        descripcion: formData.descripcion.trim() || null,
        available_stock: parseInt(formData.available_stock) || parseInt(formData.stock) || 0,
        warranty_months: parseInt(formData.warranty_months) || 0
      }

      console.log('💾 Creando producto con datos:', productData)

      const { data, error } = await supabase
        .from('productos')
        .insert([productData])
        .select()

      if (error) {
        console.error('❌ Error al insertar en DB:', error)
        throw error
      }

      console.log('✅ Producto creado exitosamente:', data)
      alert('✅ Producto creado exitosamente')
      router.push('/productos')
    } catch (error) {
      console.error('❌ Error creating producto:', error)
      alert('❌ Error al crear producto: ' + (error.message || JSON.stringify(error)))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Nuevo Producto</h1>
        <button onClick={() => router.back()} className="btn-secondary">
          Volver
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Información Básica</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referencia / SKU *
              </label>
              <input
                type="text"
                value={formData.referencia}
                onChange={(e) => setFormData({...formData, referencia: e.target.value})}
                className="input-field"
                placeholder="Ej: HP-M141W"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marca *
              </label>
              <input
                type="text"
                value={formData.marca}
                onChange={(e) => setFormData({...formData, marca: e.target.value})}
                className="input-field"
                placeholder="Ej: HP, Epson, Canon"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Producto *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                className="input-field"
                placeholder="Ej: Impresora Multifuncional HP LaserJet M141w"
                required
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.categoria}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="input-field flex-1"
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(true)}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  title="Crear nueva categoría"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {/* Subcategoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategoría
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.subcategoria}
                  onChange={(e) => setFormData({...formData, subcategoria: e.target.value})}
                  className="input-field flex-1"
                  disabled={!formData.categoria}
                >
                  <option value="">Seleccionar subcategoría</option>
                  {subcategoriasFiltradas.map(sub => (
                    <option key={sub.id} value={sub.name}>{sub.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowSubcategoryModal(true)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  title="Crear nueva subcategoría"
                  disabled={!formData.categoria}
                >
                  <Plus size={20} />
                </button>
              </div>
              {!formData.categoria && (
                <p className="text-xs text-gray-500 mt-1">Selecciona una categoría primero</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                className="input-field"
                rows="3"
                placeholder="Descripción del producto..."
              />
            </div>
          </div>
        </div>

        {/* Precios */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Precio</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio de Venta (COP) *
              </label>
              <input
                type="number"
                value={formData.precio_venta}
                onChange={(e) => setFormData({...formData, precio_venta: e.target.value})}
                className="input-field"
                min="0"
                placeholder="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IVA (%)
              </label>
              <select
                value={formData.iva}
                onChange={(e) => setFormData({...formData, iva: e.target.value})}
                className="input-field"
              >
                <option value="0">0% - Exento</option>
                <option value="5">5%</option>
                <option value="19">19% - General</option>
              </select>
            </div>
          </div>
        </div>

        {/* Inventario e Imagen */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Inventario e Imagen</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Disponible
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value, available_stock: e.target.value})}
                className="input-field"
                min="0"
                placeholder="0"
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
                placeholder="0"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagen del Producto
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tamaño máximo: 5MB. Formatos: JPG, PNG, WEBP, GIF
              </p>
              
              {imagePreview && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Vista previa:</p>
                  <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || uploading}
            className="flex-1 btn-primary disabled:opacity-50"
          >
            {uploading ? 'Subiendo imagen...' : loading ? 'Guardando...' : 'Crear Producto'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 btn-secondary"
            disabled={loading || uploading}
          >
            Cancelar
          </button>
        </div>
      </form>

      {/* Modal: Crear Categoría */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Nueva Categoría</h3>
              <button
                onClick={() => {
                  setShowCategoryModal(false)
                  setNewCategoryName('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Categoría *
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="input-field"
                placeholder="Ej: Impresoras"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    createCategory()
                  }
                }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={createCategory}
                disabled={savingCategory || !newCategoryName.trim()}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {savingCategory ? 'Creando...' : 'Crear Categoría'}
              </button>
              <button
                onClick={() => {
                  setShowCategoryModal(false)
                  setNewCategoryName('')
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                disabled={savingCategory}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Crear Subcategoría */}
      {showSubcategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Nueva Subcategoría</h3>
              <button
                onClick={() => {
                  setShowSubcategoryModal(false)
                  setNewSubcategoryName('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría Principal
              </label>
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-blue-900 font-semibold">
                {formData.categoria || 'N/A'}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Subcategoría *
              </label>
              <input
                type="text"
                value={newSubcategoryName}
                onChange={(e) => setNewSubcategoryName(e.target.value)}
                className="input-field"
                placeholder="Ej: Láser"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    createSubcategory()
                  }
                }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={createSubcategory}
                disabled={savingCategory || !newSubcategoryName.trim()}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {savingCategory ? 'Creando...' : 'Crear Subcategoría'}
              </button>
              <button
                onClick={() => {
                  setShowSubcategoryModal(false)
                  setNewSubcategoryName('')
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                disabled={savingCategory}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
