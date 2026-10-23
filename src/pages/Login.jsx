import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Layers, ShieldCheck, Sun, Moon, ArrowRight, BookOpen, KeyRound } from 'lucide-react'

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

  const handleFillDemo = (email, pass = 'password') => {
    setForm({ email, password: pass })
    toast.success(`Akun demo ${email.split('@')[0]} dipilih`)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await login(form.email, form.password)
      toast.success('Selamat datang kembali di sistem!')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Login gagal. Periksa email dan password.'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-sand-50 dark:bg-sage-950 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top micro bar */}
      <div className="p-6 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-sage-800 dark:bg-emerald-600 flex items-center justify-center text-white shadow">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-wider uppercase text-sage-800 dark:text-emerald-400 font-mono">
              ARCHIVE & ASSET
            </span>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-white dark:bg-sage-900 border border-sand-200 dark:border-sage-800 text-slate-600 dark:text-amber-300 shadow-sm transition hover:scale-105"
          title="Toggle Dark Mode"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Main card */}
      <div className="w-full max-w-md mx-auto px-4 my-auto">
        <div className="bg-white dark:bg-sage-900/90 rounded-2xl shadow-xl border border-sand-200 dark:border-sage-800 p-8 backdrop-blur transition">
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-sage-100 dark:bg-sage-800 text-sage-800 dark:text-emerald-300 mb-3">
              <BookOpen className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Portal Sirkulasi & Aset
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Masuk untuk mengelola katalog, peminjaman, & inventaris
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Alamat Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-sand-300 dark:border-sage-700 bg-sand-50/50 dark:bg-sage-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition"
                placeholder="nama@library.test"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Kata Sandi
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-sand-300 dark:border-sage-700 bg-sand-50/50 dark:bg-sage-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-medium rounded-xl shadow-md transition flex items-center justify-center space-x-2 text-sm"
            >
              <span>{submitting ? 'Memverifikasi...' : 'Masuk Sekarang'}</span>
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-6 pt-5 border-t border-sand-200 dark:border-sage-800">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Akses Cepat Akun Demo:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('admin@library.test')}
                className="py-1.5 px-2 text-xs font-medium rounded-lg bg-sand-100 hover:bg-emerald-100 dark:bg-sage-800 dark:hover:bg-emerald-900/40 text-slate-700 dark:text-slate-200 border border-sand-300 dark:border-sage-700 transition"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('staff1@library.test')}
                className="py-1.5 px-2 text-xs font-medium rounded-lg bg-sand-100 hover:bg-emerald-100 dark:bg-sage-800 dark:hover:bg-emerald-900/40 text-slate-700 dark:text-slate-200 border border-sand-300 dark:border-sage-700 transition"
              >
                Staff
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('member1@library.test')}
                className="py-1.5 px-2 text-xs font-medium rounded-lg bg-sand-100 hover:bg-emerald-100 dark:bg-sage-800 dark:hover:bg-emerald-900/40 text-slate-700 dark:text-slate-200 border border-sand-300 dark:border-sage-700 transition"
              >
                Member
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 dark:text-slate-500">
        ARCHIVE & ASSET System • Modern Eco-Archive & Quiet Luxury Architecture
      </footer>
    </div>
  )
}
