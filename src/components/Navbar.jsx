import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin logout?')) {
      logout()
      navigate('/login')
    }
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-lg font-semibold text-gray-900">LibraryApp</span>
            </Link>

            <div className="hidden md:flex ml-10 space-x-4">
              <Link to="/collections" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 rounded-md hover:bg-gray-50 transition">
                Katalog
              </Link>
              {user && (
                <>
                  <Link to="/borrowings" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 rounded-md hover:bg-gray-50 transition">
                    Peminjaman
                  </Link>
                  <Link to="/fines" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 rounded-md hover:bg-gray-50 transition">
                    Denda
                  </Link>
                </>
              )}
              {(hasRole('admin', 'staff')) && (
                <>
                  <Link to="/categories" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 rounded-md hover:bg-gray-50 transition">
                    Kategori
                  </Link>
                  <Link to="/reports" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 rounded-md hover:bg-gray-50 transition">
                    Laporan
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2">
                  <Link to="/profile" className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden border border-indigo-200 hover:ring-2 hover:ring-indigo-300 transition">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-medium text-indigo-600">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </Link>
                  <div className="hidden md:block">
                    <Link to="/profile" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition">{user.name}</Link>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
