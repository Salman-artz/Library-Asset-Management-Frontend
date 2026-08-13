import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

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
      
      toast.success('Profil berhasil diperbarui')
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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Edit Profil</h1>
          <p className="text-sm text-gray-500 mt-1">Perbarui informasi akun dan foto profil Anda</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-24 h-24 rounded-full bg-gray-100 border-4 border-white shadow-md overflow-hidden flex-shrink-0">
              {preview ? (
                <img src={preview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-3xl font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Foto Profil</label>
              <input
                type="file"
                name="avatar"
                onChange={handleFormChange}
                accept="image/*"
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Format JPG, PNG, atau WEBP. Maks 2MB.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
          
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
