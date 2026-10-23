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
  Barcode,
  Library
} from 'lucide-react'

export default function SidebarLayout({ children }) {
  const { user, logout, hasRole } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    if (window.confirm('Keluar dari sesi sistem perpustakaan?')) {
      logout()
      navigate('/login')
    }
  }

  // Navigation config
  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'staff', 'member'],
    },
    {
      to: '/collections',
      label: 'Katalog Koleksi',
      icon: BookOpen,
      roles: ['all'],
    },
    {
      to: '/borrowings',
      label: user?.role === 'member' ? 'Peminjaman Saya' : 'Sirkulasi Peminjaman',
      icon: ArrowLeftRight,
      roles: ['admin', 'staff', 'member'],
    },
    {
      to: '/fines',
      label: user?.role === 'member' ? 'Denda Saya' : 'Kas & Denda',
      icon: Receipt,
      roles: ['admin', 'staff', 'member'],
    },
    {
      to: '/categories',
      label: 'Kategori Buku',
      icon: Tags,
      roles: ['admin', 'staff'],
    },
    {
      to: '/reports',
      label: 'Laporan & Bebas Pustaka',
      icon: FileBarChart2,
      roles: ['admin', 'staff'],
    },
  ]

  const visibleNav = navItems.filter((item) => {
    if (item.roles.includes('all')) return true
    if (!user) return false
    return item.roles.some((r) => hasRole(r))
  })

  const pageTitles = {
    '/dashboard': 'Dashboard Perpustakaan',
    '/collections': 'Katalog Koleksi & Literatur',
    '/borrowings': user?.role === 'member' ? 'Riwayat Peminjaman Buku Saya' : 'Sirkulasi Peminjaman',
    '/fines': user?.role === 'member' ? 'Catatan Denda Keterlambatan' : 'Kas & Denda Keterlambatan',
    '/categories': 'Kategori Koleksi',
    '/reports': 'Laporan Analitik & Surat Bebas Pustaka',
    '/profile': 'Profil Pengguna',
  }

  const currentTitle = pageTitles[location.pathname] || 'Perpustakaan'

  return (
    <div className="h-screen w-full flex overflow-hidden bg-slate-50 dark:bg-[#0B1715] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? 'w-20' : 'w-64'
        } h-full shrink-0 bg-[#122D27] dark:bg-[#0A1A17] text-white flex flex-col justify-between transition-all duration-300 ease-in-out border-r border-[#1B3F37] shadow-xl z-30 overflow-hidden select-none`}
      >
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Brand Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-[#1E453C] shrink-0">
            <Link to="/dashboard" className="flex items-center space-x-3 overflow-hidden">
              {/* High-Contrast White & Gold Emblem for Dark Sidebar */}
              <img
                src="/logo-icon-white.png"
                alt="Pustaka Sentral"
                className="w-10 h-10 object-contain shrink-0 filter drop-shadow"
              />
              {!collapsed && (
                <div className="flex flex-col truncate">
                  <span className="font-extrabold text-sm tracking-wide uppercase text-white font-sans">
                    PUSTAKA SENTRAL
                  </span>
                  <span className="text-[11px] font-medium text-emerald-300 truncate">
                    Sistem Perpustakaan
                  </span>
                </div>
              )}
            </Link>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition"
              title={collapsed ? 'Perluas Menu' : 'Perkecil Menu'}
            >
              {collapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 mt-2 flex-1 overflow-y-auto">
            {visibleNav.map((item) => {
              const Icon = item.icon
              const active = location.pathname === item.to
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    active
                      ? 'bg-emerald-600 text-white shadow-md border-l-4 border-emerald-300'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                      active ? 'text-white' : 'text-emerald-300'
                    }`}
                  />
                  {!collapsed && (
                    <span className="ml-3 truncate">{item.label}</span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Profile & Utilities */}
        <div className="p-3 border-t border-[#1E453C] bg-[#0E241F] shrink-0">
          {user ? (
            <div className="flex flex-col space-y-2">
              <Link
                to="/profile"
                className={`flex items-center ${
                  collapsed ? 'justify-center' : 'space-x-3'
                } p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition group`}
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                {!collapsed && (
                  <div className="truncate flex-1">
                    <p className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition">
                      {user.name}
                    </p>
                    <span className="inline-block px-1.5 py-0.2 text-[10px] font-mono uppercase font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      {user.role}
                    </span>
                  </div>
                )}
              </Link>

              {/* Utility Row */}
              <div className={`flex items-center ${collapsed ? 'flex-col space-y-2' : 'justify-between'} pt-1`}>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-1.5 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-amber-300 transition text-xs font-semibold"
                  title={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
                >
                  {isDark ? (
                    <>
                      <Sun className="w-4 h-4 text-amber-300 shrink-0" />
                      {!collapsed && <span className="text-[11px] text-amber-300">Terang</span>}
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-slate-200 shrink-0" />
                      {!collapsed && <span className="text-[11px] text-slate-200">Gelap</span>}
                    </>
                  )}
                </button>

                <button
                  onClick={handleLogout}
                  className={`flex items-center text-xs text-rose-300 hover:text-white hover:bg-rose-900/60 p-2 rounded-lg transition ${
                    collapsed ? '' : 'px-3 font-semibold'
                  }`}
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  {!collapsed && <span className="ml-1.5">Keluar</span>}
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center justify-center w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition"
            >
              {!collapsed ? 'Masuk ke Sistem' : 'Login'}
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content Area - Fully Fluid & Responsive Fullscreen */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto w-full">
        {/* Top Header Bar - Clean without capsule slop */}
        <header className="h-16 shrink-0 bg-white dark:bg-[#10221E] border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 shadow-sm transition-colors w-full">
          {/* Breadcrumb / Title */}
          <div className="flex items-center space-x-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Perpustakaan
            </span>
            <span className="text-slate-300 dark:text-slate-600 font-mono">/</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {currentTitle}
            </span>
          </div>

          {/* Right actions */}
          <div className="flex items-center space-x-3">
            <Link
              to="/collections"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition shadow-sm"
            >
              <Barcode className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Scan ISBN</span>
            </Link>

            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-300 border border-slate-300 dark:border-slate-700 transition shadow-sm text-xs font-semibold"
              title={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-300 text-xs font-bold">Terang</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-600" />
                  <span className="text-slate-700 text-xs font-bold">Gelap</span>
                </>
              )}
            </button>

            {user && (
              <div className="hidden sm:flex items-center space-x-2 pl-3 border-l border-slate-200 dark:border-slate-700">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</p>
                  <span className="text-[10px] font-mono uppercase font-semibold text-emerald-700 dark:text-emerald-400">
                    {user.role}
                  </span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content - Full screen fluid width */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
