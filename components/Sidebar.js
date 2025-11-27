'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/login')
  }

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Cotizaciones', path: '/cotizaciones', icon: '📋' },
    { name: 'Garantías', path: '/garantias', icon: '🔧' },
    { name: 'Taller', path: '/taller', icon: '🛠️' },
    { name: 'Clientes', path: '/clientes', icon: '👥' },
    { name: 'Productos', path: '/productos', icon: '📦' },
    { name: 'Domicilios', path: '/domicilios', icon: '🚚' },
    { name: 'Reportes', path: '/reportes', icon: '📈' },
    { name: 'Mi Perfil', path: '/perfil', icon: '👤' },
  ]

  return (
    <aside className="w-64 bg-white shadow-lg min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-800">Mega Suministros</h2>
        {user && (
          <div className="mt-2">
            <p className="text-sm text-gray-600">{user.nombre}</p>
            <p className="text-xs text-gray-500">Vendedor #{user.vendedor_id}</p>
          </div>
        )}
      </div>

      {/* Botón de Inicio Destacado */}
      <div className="p-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg transition duration-200"
        >
          <span className="text-xl">🏠</span>
          <span>Inicio</span>
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition duration-200 ${
                  pathname === item.path
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="w-full btn-danger"
        >
          Cerrar Sesión
        </button>
      </div>
    </aside>
  )
}
