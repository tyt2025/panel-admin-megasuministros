'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function NuevoDomicilio() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    neighborhood: '',
    price_cop: '',
    tipo: 'barrio' // barrio, hotel, negocio
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
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.neighborhood.trim()) {
      alert('Ingresa el nombre del barrio, hotel o negocio')
      return
    }

    if (!formData.price_cop || formData.price_cop <= 0) {
      alert('Ingresa un valor válido para el domicilio')
      return
    }

    setLoading(true)

    try {
      // Verificar si ya existe
      const { data: existente } = await supabase
        .from('delivery_rates')
        .select('id')
        .ilike('neighborhood', formData.neighborhood.trim())
        .single()

      if (existente) {
        alert('Ya existe un domicilio con ese nombre. Por favor usa otro nombre.')
        setLoading(false)
        return
      }

      // Insertar nuevo domicilio
      const { error } = await supabase
        .from('delivery_rates')
        .insert([{
          neighborhood: formData.neighborhood.trim(),
          price_cop: parseInt(formData.price_cop),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])

      if (error) throw error

      alert('Domicilio agregado exitosamente')
      router.push('/domicilios')
    } catch (error) {
      console.error('Error creating domicilio:', error)
      alert('Error al crear domicilio')
    } finally {
      setLoading(false)
    }
  }

  const tarifasReferencia = [
    { rango: 'Centro y cercanos', valor: 6000 },
    { rango: 'Zona intermedia', valor: 8000 },
    { rango: 'Zona alejada', valor: 12000 },
    { rango: 'Zona turística', valor: 18000 }
  ]

  if (!user) {
    return <div className="text-center">Cargando...</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Agregar Nuevo Domicilio</h1>
          <p className="text-gray-600 mt-1">
            Registra una nueva zona de envío con su tarifa
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Volver
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="card space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-3">
              Información del Domicilio
            </h3>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Ubicación
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, tipo: 'barrio' }))}
                  className={`p-3 border-2 rounded-lg text-center transition ${
                    formData.tipo === 'barrio'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-1">🏘️</div>
                  <div className="text-sm font-medium">Barrio</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, tipo: 'hotel' }))}
                  className={`p-3 border-2 rounded-lg text-center transition ${
                    formData.tipo === 'hotel'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-1">🏨</div>
                  <div className="text-sm font-medium">Hotel</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, tipo: 'negocio' }))}
                  className={`p-3 border-2 rounded-lg text-center transition ${
                    formData.tipo === 'negocio'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-1">🏢</div>
                  <div className="text-sm font-medium">Negocio</div>
                </button>
              </div>
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del {formData.tipo === 'barrio' ? 'Barrio' : formData.tipo === 'hotel' ? 'Hotel' : 'Negocio'} *
              </label>
              <input
                type="text"
                name="neighborhood"
                value={formData.neighborhood}
                onChange={handleChange}
                placeholder={
                  formData.tipo === 'barrio' 
                    ? 'Ej: El Rodadero, Santa Marta Centro'
                    : formData.tipo === 'hotel'
                    ? 'Ej: Hotel Zuana, Hotel Irotama'
                    : 'Ej: Centro Comercial Buenavista'
                }
                required
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ingresa el nombre completo y descriptivo
              </p>
            </div>

            {/* Valor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor del Domicilio (COP) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  name="price_cop"
                  value={formData.price_cop}
                  onChange={handleChange}
                  placeholder="6000"
                  required
                  min="0"
                  step="1000"
                  className="input-field pl-8"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Ingresa el valor en pesos colombianos (sin puntos ni comas)
              </p>
            </div>

            {/* Botones */}
            <div className="flex space-x-3 pt-4 border-t">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? 'Guardando...' : '💾 Guardar Domicilio'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar con tarifas de referencia */}
        <div className="space-y-6">
          {/* Tarifas de referencia */}
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900 mb-3">
              📊 Tarifas de Referencia
            </h4>
            <div className="space-y-2">
              {tarifasReferencia.map((tarifa, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-white rounded">
                  <span className="text-xs text-gray-700">{tarifa.rango}</span>
                  <span className="text-sm font-bold text-green-600">
                    ${tarifa.valor.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="card bg-yellow-50 border-l-4 border-yellow-400">
            <h4 className="text-sm font-semibold text-yellow-900 mb-2 flex items-center">
              💡 Tips
            </h4>
            <ul className="text-xs text-yellow-800 space-y-2">
              <li>• Las tarifas se aplican automáticamente en cotizaciones</li>
              <li>• Puedes editar los valores después de crearlos</li>
              <li>• Usa nombres descriptivos y únicos</li>
              <li>• Las tarifas están en pesos colombianos (COP)</li>
            </ul>
          </div>

          {/* Info */}
          <div className="card bg-gray-50">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              ℹ️ Información
            </h4>
            <p className="text-xs text-gray-600">
              Los domicilios se agrupan por zonas en Santa Marta. Asegúrate de ingresar 
              el nombre correcto para evitar duplicados.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
