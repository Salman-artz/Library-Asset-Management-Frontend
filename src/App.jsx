import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Collections from './pages/Collections'
import Categories from './pages/Categories'
import Borrowings from './pages/Borrowings'
import Fines from './pages/Fines'
import Reports from './pages/Reports'
import Profile from './pages/Profile'

export default function App() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/collections" element={<Collections />} />

        {/* Protected routes (any authenticated user) */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/borrowings" element={<ProtectedRoute><Borrowings /></ProtectedRoute>} />
        <Route path="/fines" element={<ProtectedRoute><Fines /></ProtectedRoute>} />

        {/* Protected routes (admin/staff only) */}
        <Route path="/categories" element={<ProtectedRoute roles={['admin', 'staff']}><Categories /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute roles={['admin', 'staff']}><Reports /></ProtectedRoute>} />

        {/* Default & 404 */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h1 className="text-4xl font-bold text-gray-400">404</h1>
            <p className="text-gray-500 mt-2">Halaman tidak ditemukan</p>
          </div>
        } />
      </Routes>
    </div>
  )
}
