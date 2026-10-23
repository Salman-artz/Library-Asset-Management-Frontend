import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Library, Sun, Moon, ArrowRight, BookOpen, Lock, Mail } from 'lucide-react'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await login(form.email, form.password)
      toast.success('Selamat datang kembali di sistem perpustakaan!')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Login gagal. Periksa email dan password.'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-[#0B1715] text-slate-800 dark:text-slate-100 transition-colors w-full">
      {/* Top bar */}
      <div className="p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-3">
          <img
            src="/logo-icon.png"
            alt="Pustaka Sentral"
            className="w-11 h-11 object-contain shrink-0 filter drop-shadow-sm"
          />
          <div>
            <span className="font-extrabold text-base tracking-wide uppercase text-slate-900 dark:text-white font-sans">
              PUSTAKA SENTRAL
            </span>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Sistem Informasi Perpustakaan Terpadu
            </span>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-amber-300 shadow-sm transition hover:scale-105"
          title="Toggle Dark Mode"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Login Card - Clean, authentic, no demo pill clutter */}
      <div className="w-full max-w-md mx-auto px-4 my-auto">
        <div className="bg-white dark:bg-[#122420] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 transition">
          <div className="text-center mb-7">
            <img
              src="/logo-icon.png"
              alt="Pustaka Sentral Emblem"
              className="w-20 h-20 mx-auto object-contain filter drop-shadow-md mb-3"
            />
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Masuk ke Perpustakaan
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Gunakan akun terdaftar untuk mengakses katalog & sirkulasi
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0c1815] text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs font-medium transition"
                  placeholder="nama@library.test"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Kata Sandi
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0c1815] text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs font-medium transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-2 text-xs mt-2"
            >
              <span>{submitting ? 'Memverifikasi...' : 'Masuk Sekarang'}</span>
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            <span>Belum memiliki kartu anggota? Hubungi meja sirkulasi perpustakaan.</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-5 text-center text-xs text-slate-500 dark:text-slate-500 font-medium">
        Pustaka Sentral • Sistem Informasi Perpustakaan & Manajemen Koleksi
      </footer>
    </div>
  )
}
