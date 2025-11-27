'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Perfil() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Datos del perfil
  const [perfilData, setPerfilData] = useState({
    username: '',
    nombre: '',
    vendedor_id: null,
    ultimo_cambio_password: null
  })

  // Cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [message, setMessage] = useState({ type: '', text: '' })
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    loadUserProfile(parsedUser.id)
  }, [router])

  const loadUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('usuarios_admin')
        .select('username, nombre, vendedor_id, ultimo_cambio_password')
        .eq('id', userId)
        .single()

      if (error) throw error

      setPerfilData(data)
    } catch (error) {
      console.error('Error al cargar perfil:', error)
      setMessage({ type: 'error', text: 'Error al cargar información del perfil' })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    setChangingPassword(true)

    // Validaciones
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Todos los campos son obligatorios' })
      setChangingPassword(false)
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas nuevas no coinciden' })
      setChangingPassword(false)
      return
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 8 caracteres' })
      setChangingPassword(false)
      return
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setMessage({ type: 'error', text: 'La nueva contraseña debe ser diferente a la actual' })
      setChangingPassword(false)
      return
    }

    try {
      // Verificar contraseña actual
      const { data: userData, error: verifyError } = await supabase
        .from('usuarios_admin')
        .select('*')
        .eq('id', user.id)
        .eq('password', passwordData.currentPassword)
        .single()

      if (verifyError || !userData) {
        setMessage({ type: 'error', text: 'La contraseña actual es incorrecta' })
        setChangingPassword(false)
        return
      }

      // Actualizar contraseña
      const { error: updateError } = await supabase
        .from('usuarios_admin')
        .update({
          password: passwordData.newPassword,
          ultimo_cambio_password: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setMessage({ 
        type: 'success', 
        text: '¡Contraseña actualizada exitosamente! Por favor inicia sesión nuevamente.' 
      })

      // Limpiar formulario
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        localStorage.removeItem('user')
        router.push('/login')
      }, 3000)

    } catch (error) {
      console.error('Error al cambiar contraseña:', error)
      setMessage({ type: 'error', text: 'Error al cambiar la contraseña. Intenta nuevamente.' })
    } finally {
      setChangingPassword(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Mi Perfil</h1>
        <p className="text-gray-600 mt-2">Administra tu información y seguridad</p>
      </div>

      {/* Información del Perfil */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">
            👤
          </span>
          Información de Usuario
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Usuario
            </label>
            <p className="text-lg text-gray-800 font-medium">{perfilData.username}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Nombre Completo
            </label>
            <p className="text-lg text-gray-800 font-medium">{perfilData.nombre}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              ID de Vendedor
            </label>
            <p className="text-lg text-gray-800 font-medium">{perfilData.vendedor_id}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Último Cambio de Contraseña
            </label>
            <p className="text-lg text-gray-800 font-medium">
              {formatDate(perfilData.ultimo_cambio_password)}
            </p>
          </div>
        </div>
      </div>

      {/* Cambio de Contraseña */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <span className="bg-green-100 text-green-600 p-2 rounded-lg mr-3">
            🔒
          </span>
          Cambiar Contraseña
        </h2>

        {message.text && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña Actual *
            </label>
            <input
              id="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="input-field"
              placeholder="Ingresa tu contraseña actual"
              disabled={changingPassword}
              required
            />
          </div>

          <div className="border-t pt-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Nueva Contraseña *
              </label>
              <input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="input-field"
                placeholder="Mínimo 8 caracteres"
                disabled={changingPassword}
                required
                minLength={8}
              />
              <p className="text-sm text-gray-500 mt-1">
                Debe tener al menos 8 caracteres
              </p>
            </div>

            <div className="mt-4">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Nueva Contraseña *
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="input-field"
                placeholder="Repite tu nueva contraseña"
                disabled={changingPassword}
                required
                minLength={8}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={changingPassword}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {changingPassword ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Cambiando...
                </span>
              ) : (
                '🔒 Cambiar Contraseña'
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setPasswordData({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                })
                setMessage({ type: '', text: '' })
              }}
              className="btn-secondary flex-1"
              disabled={changingPassword}
            >
              Cancelar
            </button>
          </div>
        </form>

        {/* Recomendaciones de Seguridad */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">💡 Recomendaciones de Seguridad</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Usa una contraseña única que no uses en otros sitios</li>
            <li>• Combina letras mayúsculas, minúsculas, números y símbolos</li>
            <li>• Cambia tu contraseña regularmente (cada 3-6 meses)</li>
            <li>• No compartas tu contraseña con nadie</li>
            <li>• Evita usar información personal obvia</li>
          </ul>
        </div>
      </div>

      {/* Botón Volver */}
      <div className="mt-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="btn-secondary"
        >
          ← Volver al Dashboard
        </button>
      </div>
    </div>
  )
}
