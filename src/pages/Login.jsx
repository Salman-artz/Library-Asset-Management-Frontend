import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Layers, ShieldCheck, Sun, Moon, ArrowRight, BookOpen, KeyRound, User, Shield, Briefcase } from 'lucide-react'

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
    const roleName = email.includes('admin') ? 'Admin Library' : email.includes('staff') ? 'Staff Perpustakaan' : 'Member Pembaca'
    toast.success(`Akun Demo [${roleName}] dipilih! Klik Masuk.`)
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
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-[#0B1715] text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top micro bar */}
      <div className="p-6 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-wider uppercase text-slate-900 dark:text-emerald-400 font-mono">
              ARCHIVE & ASSET
            </span>
            <span className="block text-[10px] text-slate-500 font-semibold">Institutional Circulation System</span>
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

      {/* Main card */}
      <div className="w-full max-w-md mx-auto px-4 my-auto">
        <div className="bg-white dark:bg-[#122420] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 transition">
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 mb-3 font-bold">
              <BookOpen className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Portal Sirkulasi & Aset
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Masuk untuk mengelola katalog, peminjaman, & inventaris
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Alamat Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0c1815] text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs font-medium transition"
                placeholder="nama@library.test"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Kata Sandi
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0c1815] text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs font-medium transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-2 text-xs"
            >
              <span>{submitting ? 'Memverifikasi...' : 'Masuk Sekarang'}</span>
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Quick Demo Fill Buttons - High Contrast with Role Badges */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Pilih Role Akun Demo (1-Click Fill):
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('admin@library.test')}
                className="py-2 px-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-emerald-100 dark:bg-slate-800 dark:hover:bg-emerald-950 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition flex flex-col items-center gap-1"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('staff1@library.test')}
                className="py-2 px-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-blue-100 dark:bg-slate-800 dark:hover:bg-blue-950 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition flex flex-col items-center gap-1"
              >
                <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                <span>Staff</span>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('member1@library.test')}
                className="py-2 px-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-amber-950 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition flex flex-col items-center gap-1"
              >
                <User className="w-3.5 h-3.5 text-amber-600" />
                <span>Member</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 font-medium">
        ARCHIVE & ASSET System • Sage Forest & Warm Sand Architecture
      </footer>
    </div>
  )
}
