import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import {
  LayoutDashboard,
  BookOpen,
  ArrowLeftRight,
  Receipt,
  Tags,
  FileBarChart2,
  Menu,
  ChevronLeft,
  Sun,
  Moon,
  LogOut,
  Shield,
  Layers,
  Sparkles,
  Barcode
} from 'lucide-react'

export default function SidebarLayout({ children }) {
  const { user, logout, hasRole } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    if (window.confirm('Keluar dari sesi Library & Asset System?')) {
      logout()
      navigate('/login')
    }
  }

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'staff', 'member'],
    },
    {
      to: '/collections',
      label: 'Katalog & Aset',
      icon: BookOpen,
      roles: ['all'],
    },
    {
      to: '/borrowings',
      label: 'Sirkulasi & Pinjam',
      icon: ArrowLeftRight,
      roles: ['admin', 'staff', 'member'],
    },
    {
      to: '/fines',
      label: 'Kas & Denda',
      icon: Receipt,
      roles: ['admin', 'staff', 'member'],
    },
    {
      to: '/categories',
      label: 'Kategori Koleksi',
      icon: Tags,
      roles: ['admin', 'staff'],
    },
    {
      to: '/reports',
      label: 'Laporan & Audit',
      icon: FileBarChart2,
      roles: ['admin', 'staff'],
    },
  ]

  const visibleNav = navItems.filter((item) => {
    if (item.roles.includes('all')) return true
    if (!user) return false
    return item.roles.some((r) => hasRole(r))
  })

  return (
    <div className="min-h-screen flex bg-sand-50 dark:bg-sage-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? 'w-20' : 'w-64'
        } shrink-0 bg-sage-800 dark:bg-[#0c1816] text-white flex flex-col justify-between transition-all duration-300 ease-in-out border-r border-sage-700/50 shadow-xl z-30`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-sage-700/60">
            <Link to="/dashboard" className="flex items-center space-x-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0 shadow-md">
                <Layers className="w-5 h-5 text-white" />
              </div>
              {!collapsed && (
                <div className="flex flex-col truncate">
                  <span className="font-bold text-sm tracking-wider uppercase text-white font-mono">
                    ARCHIVE & ASSET
                  </span>
                  <span className="text-[11px] text-emerald-200/80 truncate">
                    Circulation Engine
                  </span>
                </div>
              )}
            </Link>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg hover:bg-sage-700/70 text-sage-200 hover:text-white transition"
              title={collapsed ? 'Perluas Menu' : 'Perkecil Menu'}
            >
              {collapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 mt-2">
            {visibleNav.map((item) => {
              const Icon = item.icon
              const active = location.pathname === item.to
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    active
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-inner'
                      : 'text-sage-100/80 hover:bg-sage-700/50 hover:text-white'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                      active ? 'text-emerald-400' : 'text-sage-300'
                    }`}
                  />
                  {!collapsed && (
                    <span className="ml-3 truncate">{item.label}</span>
                  )}
                  {!collapsed && active && (
                    <span className="ml-auto w-1.5 h-4 rounded-full bg-emerald-400" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Profile & Utilities */}
        <div className="p-3 border-t border-sage-700/60 bg-sage-900/40">
          {user ? (
            <div className="flex flex-col space-y-2">
              <div
                className={`flex items-center ${
                  collapsed ? 'justify-center' : 'space-x-3'
                } p-2 rounded-xl bg-sage-800/60 border border-sage-700/50`}
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-600/30 border border-emerald-400/40 text-emerald-300 flex items-center justify-center font-bold text-sm shrink-0">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                {!collapsed && (
                  <div className="truncate flex-1">
                    <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                    <span className="inline-block px-1.5 py-0.5 text-[10px] font-mono uppercase rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      {user.role}
                    </span>
                  </div>
                )}
              </div>

              {/* Utility Row */}
              <div className={`flex items-center ${collapsed ? 'flex-col space-y-2' : 'justify-between'} pt-1`}>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-sage-800/80 hover:bg-sage-700 text-sage-200 hover:text-amber-300 transition"
                  title={isDark ? 'Mode Terang' : 'Mode Gelap'}
                >
                  {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
                </button>

                <button
                  onClick={handleLogout}
                  className={`flex items-center text-xs text-rose-300 hover:text-rose-100 hover:bg-rose-950/60 p-2 rounded-lg transition ${
                    collapsed ? '' : 'px-3'
                  }`}
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  {!collapsed && <span className="ml-1.5 font-medium">Keluar</span>}
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center justify-center w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
            >
              {!collapsed ? 'Masuk Sistem' : 'Login'}
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-16 bg-white/80 dark:bg-sage-900/60 backdrop-blur border-b border-sand-200 dark:border-sage-800/80 px-6 flex items-center justify-between sticky top-0 z-20 transition-colors">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sistem Aktif • Database Online
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/collections"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-sand-100 dark:bg-sage-800 hover:bg-sand-200 dark:hover:bg-sage-700 text-slate-700 dark:text-slate-200 border border-sand-300 dark:border-sage-700 transition"
            >
              <Barcode className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Scan Barcode / ISBN
            </Link>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-sand-100 dark:bg-sage-800 hover:bg-sand-200 dark:hover:bg-sage-700 text-slate-600 dark:text-amber-300 border border-sand-300 dark:border-sage-700 transition"
              title="Ganti Tema"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
