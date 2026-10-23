import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import SidebarLayout from './components/SidebarLayout'
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
  return (
    <Routes>
      {/* Public standalone auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Pages rendered within SidebarLayout */}
      <Route
        path="/collections"
        element={
          <SidebarLayout>
            <Collections />
          </SidebarLayout>
        }
      />
      <Route
        path="/dashboard"
        element={
          <SidebarLayout>
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </SidebarLayout>
        }
      />
      <Route
        path="/profile"
        element={
          <SidebarLayout>
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          </SidebarLayout>
        }
      />
      <Route
        path="/borrowings"
        element={
          <SidebarLayout>
            <ProtectedRoute>
              <Borrowings />
            </ProtectedRoute>
          </SidebarLayout>
        }
      />
      <Route
        path="/fines"
        element={
          <SidebarLayout>
            <ProtectedRoute>
              <Fines />
            </ProtectedRoute>
          </SidebarLayout>
        }
      />
      <Route
        path="/categories"
        element={
          <SidebarLayout>
            <ProtectedRoute roles={['admin', 'staff']}>
              <Categories />
            </ProtectedRoute>
          </SidebarLayout>
        }
      />
      <Route
        path="/reports"
        element={
          <SidebarLayout>
            <ProtectedRoute roles={['admin', 'staff']}>
              <Reports />
            </ProtectedRoute>
          </SidebarLayout>
        }
      />

      {/* Defaults */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="*"
        element={
          <SidebarLayout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <h1 className="text-6xl font-extrabold text-emerald-600 font-mono">404</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">Halaman tidak ditemukan</p>
            </div>
          </SidebarLayout>
        }
      />
    </Routes>
  )
}
