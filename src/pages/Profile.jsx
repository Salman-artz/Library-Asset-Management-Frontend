import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { User, Mail, Shield, Camera, Save, ArrowLeft } from 'lucide-react'

export default function Profile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: null,
  })
  
  const [preview, setPreview] = useState(user?.avatar_url || null)
  const [submitting, setSubmitting] = useState(false)

  const handleFormChange = (e) => {
    const { name, value, files } = e.target
    if (name === 'avatar') {
      const file = files[0]
      setForm({ ...form, avatar: file })
      if (file) {
        setPreview(URL.createObjectURL(file))
      }
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      const formData = new FormData()
      formData.append('_method', 'PATCH')
      formData.append('name', form.name)
      formData.append('email', form.email)
      if (form.avatar) {
        formData.append('avatar', form.avatar)
      }

      const res = await api.post('/auth/profile', formData)
      
      const updatedUser = res.data.data?.user || res.data.user || res.data.data
      if (updatedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser))
        window.location.reload()
      }
      
      toast.success('Profil berhasil diperbarui!')
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) {
        const first = Object.values(errors)[0]?.[0]
        toast.error(first || 'Gagal memperbarui profil')
      } else {
        toast.error(err.response?.data?.message || 'Gagal memperbarui profil')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <User className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          Pengaturan Akun & Profil
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
          Kelola informasi identitas, foto profil, dan peran akses sistem sirkulasi
        </p>
      </div>

      <div className="bg-white dark:bg-[#122420] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Avatar section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="relative w-24 h-24 rounded-2xl bg-sand-100 dark:bg-sage-800 border-2 border-emerald-500/50 shadow overflow-hidden shrink-0 flex items-center justify-center">
              {preview ? (
                <img src={preview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{user?.name}</h3>
                <span className="inline-block px-2 py-0.5 mt-1 rounded-full text-[10px] font-mono uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
                  Peran Akses: {user?.role}
                </span>
              </div>
              <input
                type="file"
                name="avatar"
                onChange={handleFormChange}
                accept="image/*"
                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sand-100 dark:file:bg-sage-800 file:text-slate-700 dark:file:text-slate-200 hover:file:bg-sand-200"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Nama Lengkap
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-sand-50/50 dark:bg-sage-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Alamat Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-sand-50/50 dark:bg-sage-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow transition disabled:opacity-50 text-xs"
            >
              <Save className="w-4 h-4" />
              {submitting ? 'Menyimpan Perubahan...' : 'Simpan Profil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
