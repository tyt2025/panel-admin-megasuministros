'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function NuevaGarantia() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [photoPreviews, setPhotoPreviews] = useState([])
  const [formData, setFormData] = useState({
    nombre_cliente: '',
    documento: '',
    referencia: '',
    marca: '',
    numero_serie: '',
    tipo_equipo: 'computador',
    fecha_compra: '',
    descripcion_falla: '',
    trae_caja: false,
    trae_cables: false,
    trae_cargador: false,
    observaciones: '',
    estado: 'recibido'
  })

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
  }, [router])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Validar tamaño máximo (5MB por imagen)
    const maxSize = 5 * 1024 * 1024
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        alert(`La imagen ${file.name} supera el tamaño máximo de 5MB`)
        return false
      }
      return true
    })

    // Crear vistas previas
    const newPreviews = validFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }))

    setSelectedFiles(prev => [...prev, ...validFiles])
    setPhotoPreviews(prev => [...prev, ...newPreviews])
  }

  const removePhoto = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setPhotoPreviews(prev => {
      // Revocar URL del preview
      URL.revokeObjectURL(prev[index].url)
      return prev.filter((_, i) => i !== index)
    })
  }

  const uploadPhotos = async (garantiaId) => {
    if (selectedFiles.length === 0) return []

    setUploadingPhotos(true)
    const uploadedPhotos = []

    try {
      for (const file of selectedFiles) {
        // Generar nombre único
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(7)
        const extension = file.name.split('.').pop()
        const fileName = `${timestamp}-${randomString}.${extension}`
        const filePath = `GARANTIAS_EVIDENCIAS/${fileName}`

        // Subir a Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('garantias_fotos')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) throw uploadError

        // Obtener URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('garantias_fotos')
          .getPublicUrl(filePath)

        // Guardar en tabla garantias_fotos
        const { data: fotoData, error: fotoError } = await supabase
          .from('garantias_fotos')
          .insert([{
            garantia_id: garantiaId,
            url_foto: publicUrl,
            descripcion: file.name
          }])
          .select()

        if (fotoError) throw fotoError

        uploadedPhotos.push(fotoData[0])
      }

      return uploadedPhotos
    } catch (error) {
      console.error('Error uploading photos:', error)
      throw error
    } finally {
      setUploadingPhotos(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validaciones
      if (!formData.nombre_cliente.trim()) {
        alert('El nombre del cliente es obligatorio')
        setLoading(false)
        return
      }
      if (!formData.documento.trim()) {
        alert('El NIT o cédula es obligatorio')
        setLoading(false)
        return
      }
      if (!formData.referencia.trim()) {
        alert('La referencia del producto es obligatoria')
        setLoading(false)
        return
      }
      if (!formData.marca.trim()) {
        alert('La marca es obligatoria')
        setLoading(false)
        return
      }
      if (!formData.descripcion_falla.trim()) {
        alert('La descripción de la falla es obligatoria')
        setLoading(false)
        return
      }

      // 1. Insertar la garantía
      const { data, error } = await supabase
        .from('garantias')
        .insert([{
          ...formData,
          vendedor_id: user.vendedor_id
        }])
        .select()

      if (error) throw error

      const garantiaId = data[0].id

      // 2. Subir fotos si hay
      if (selectedFiles.length > 0) {
        await uploadPhotos(garantiaId)
      }

      alert('Garantía registrada exitosamente' + (selectedFiles.length > 0 ? ' con fotos de evidencia' : ''))
      // Redirigir al detalle y auto-generar PDF
      router.push(`/garantias/${garantiaId}?print=true`)
    } catch (error) {
      console.error('Error creating garantia:', error)
      alert('Error al registrar garantía: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div className="text-center">Cargando...</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Registrar Garantía</h1>
        <p className="text-gray-600 mt-1">Ingresa los datos del producto en garantía</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Datos del Cliente */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📋 Datos del Cliente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Cliente *
              </label>
              <input
                type="text"
                name="nombre_cliente"
                value={formData.nombre_cliente}
                onChange={handleChange}
                className="input-field"
                placeholder="Juan Pérez"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NIT o Cédula *
              </label>
              <input
                type="text"
                name="documento"
                value={formData.documento}
                onChange={handleChange}
                className="input-field"
                placeholder="1234567890"
                required
              />
            </div>
          </div>
        </div>

        {/* Datos del Producto */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🔧 Datos del Producto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referencia *
              </label>
              <input
                type="text"
                name="referencia"
                value={formData.referencia}
                onChange={handleChange}
                className="input-field"
                placeholder="HP Pavilion 15"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marca *
              </label>
              <input
                type="text"
                name="marca"
                value={formData.marca}
                onChange={handleChange}
                className="input-field"
                placeholder="HP, Epson, Canon..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Serial / Número de Serie
              </label>
              <input
                type="text"
                name="numero_serie"
                value={formData.numero_serie}
                onChange={handleChange}
                className="input-field"
                placeholder="SN123456789"
              />
              <p className="text-xs text-gray-500 mt-1">
                Opcional - Si el equipo tiene serial visible
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Equipo *
              </label>
              <select
                name="tipo_equipo"
                value={formData.tipo_equipo}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="computador">Computador</option>
                <option value="laptop">Laptop</option>
                <option value="impresora">Impresora</option>
                <option value="monitor">Monitor</option>
                <option value="teclado">Teclado</option>
                <option value="mouse">Mouse</option>
                <option value="tablet">Tablet</option>
                <option value="celular">Celular</option>
                <option value="disco_duro">Disco Duro</option>
                <option value="memoria_ram">Memoria RAM</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Compra
              </label>
              <input
                type="date"
                name="fecha_compra"
                value={formData.fecha_compra}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción de la Falla *
            </label>
            <textarea
              name="descripcion_falla"
              value={formData.descripcion_falla}
              onChange={handleChange}
              className="input-field"
              rows="4"
              placeholder="Describe detalladamente el problema del equipo..."
              required
            />
          </div>
        </div>

        {/* Accesorios que trae */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📦 Accesorios</h2>
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="trae_caja"
                checked={formData.trae_caja}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">Trae caja original</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="trae_cables"
                checked={formData.trae_cables}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">Trae cables</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="trae_cargador"
                checked={formData.trae_cargador}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">Trae cargador</span>
            </label>
          </div>
        </div>

        {/* Fotos de Evidencia */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📸 Fotos de Evidencia</h2>
          <div className="space-y-4">
            <div>
              <label className="block w-full">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-medium text-blue-600">Click para seleccionar imágenes</span>
                    <span className="text-gray-500"> o arrastra y suelta</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP hasta 5MB por imagen</p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </label>
            </div>

            {/* Vista previa de fotos */}
            {photoPreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photoPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview.url}
                      alt={`Evidencia ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <p className="text-xs text-gray-500 mt-1 truncate">{preview.name}</p>
                  </div>
                ))}
              </div>
            )}

            {selectedFiles.length > 0 && (
              <p className="text-sm text-green-600">
                ✓ {selectedFiles.length} {selectedFiles.length === 1 ? 'foto seleccionada' : 'fotos seleccionadas'}
              </p>
            )}
          </div>
        </div>

        {/* Observaciones */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📝 Observaciones</h2>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            className="input-field"
            rows="3"
            placeholder="Ejemplo: Equipo con rayones en la tapa, golpe en esquina inferior derecha..."
          />
          <p className="text-sm text-gray-500 mt-1">
            Anota aquí cualquier detalle adicional como rayones, golpes, partes faltantes, etc.
          </p>
        </div>

        {/* Estado Inicial */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📊 Estado</h2>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            className="input-field"
            required
          >
            <option value="recibido">Recibido</option>
            <option value="en_revision">En Revisión</option>
            <option value="reparado">Reparado</option>
            <option value="entregado">Entregado</option>
            <option value="sin_solucion">Sin Solución</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
            disabled={loading || uploadingPhotos}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || uploadingPhotos}
          >
            {loading 
              ? (uploadingPhotos ? 'Subiendo fotos...' : 'Guardando...') 
              : 'Registrar Garantía'}
          </button>
        </div>
      </form>
    </div>
  )
}
