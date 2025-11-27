'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

// Configuración directa de Supabase
const supabaseUrl = 'https://cxxifwpwarbrrodtzyqn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4eGlmd3B3YXJicnJvZHR6eXFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMjc5OTAsImV4cCI6MjA3MzgwMzk5MH0.tMgoakEvw8wsvrWZpRClZo3BpiUIJ4OQrQsiM4BGM54'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function EditarCliente() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState(null)
  const router = useRouter()
  const params = useParams()
  
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    nit: '',
    email: '',
    direccion: '',
    ciudad: ''
  })

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
    loadCliente()
  }, [])

  const loadCliente = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      
      setFormData({
        nombre: data.nombre || '',
        telefono: data.telefono || '',
        nit: data.nit || '',
        email: data.email || '',
        direccion: data.direccion || '',
        ciudad: data.ciudad || ''
      })
    } catch (error) {
      console.error('Error loading cliente:', error)
      alert('Error al cargar cliente')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.nombre || !formData.telefono) {
      alert('Nombre y teléfono son obligatorios')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('clientes')
        .update({
          nombre: formData.nombre,
          telefono: formData.telefono,
          nit: formData.nit || null,
          email: formData.email || null,
          direccion: formData.direccion || null,
          ciudad: formData.ciudad || null
          // ✅ QUITAMOS la línea de updated_at porque la columna no existe
        })
        .eq('id', params.id)

      if (error) throw error

      alert('Cliente actualizado exitosamente')
      router.push('/clientes')
    } catch (error) {
      console.error('Error updating cliente:', error)
      alert('Error al actualizar cliente: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (loading) {
    return <div className="text-center p-8">Cargando...</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Editar Cliente</h1>
          <p className="text-gray-600 mt-1">Actualiza la información del cliente</p>
        </div>
        <button
          onClick={() => router.push('/clientes')}
          className="btn-secondary"
        >
          ← Volver
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="Nombre del cliente"
            />
          </div>

          <div>
            <label className="label">
              Teléfono <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="3001234567"
            />
          </div>

          <div>
            <label className="label">NIT</label>
            <input
              type="text"
              name="nit"
              value={formData.nit}
              onChange={handleChange}
              className="input-field"
              placeholder="900123456-7"
            />
          </div>

          <div className="md:col-span-2">
            <label className="label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              placeholder="cliente@ejemplo.com"
            />
          </div>

          <div className="md:col-span-2">
            <label className="label">Dirección</label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              className="input-field"
              placeholder="Calle 123 #45-67"
            />
          </div>

          <div>
            <label className="label">Ciudad</label>
            <input
              type="text"
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              className="input-field"
              placeholder="Santa Marta"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => router.push('/clientes')}
            className="btn-secondary"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
