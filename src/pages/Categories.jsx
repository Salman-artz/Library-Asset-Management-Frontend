import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { categoryService } from '../services'
import { useAuth } from '../context/AuthContext'
import {
  Tags,
  Plus,
  Search,
  Edit2,
  Trash2,
  FolderOpen,
  Layers
} from 'lucide-react'

export default function Categories() {
  const { hasRole } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const params = { per_page: 50 }
      if (search) params.search = search
      const res = await categoryService.getCategories(params)
      const d = res.data.data
      setCategories(d.data || d || [])
    } catch (err) {
      toast.error('Gagal memuat kategori')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(fetchCategories, 300)
    return () => clearTimeout(timer)
  }, [search])

  const openCreateModal = () => {
    setEditing(null)
    setName('')
    setShowModal(true)
  }

  const openEditModal = (cat) => {
    setEditing(cat)
    setName(cat.name)
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Nama kategori wajib diisi')
      return
    }
    setSubmitting(true)
    try {
      if (editing) {
        await categoryService.updateCategory(editing.id, { name })
        toast.success('Kategori berhasil diperbarui')
      } else {
        await categoryService.createCategory({ name })
        toast.success('Kategori berhasil ditambahkan')
      }
      setShowModal(false)
      fetchCategories()
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) {
        toast.error(Object.values(errors)[0]?.[0] || 'Gagal menyimpan')
      } else {
        toast.error(err.response?.data?.message || 'Gagal menyimpan')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus kategori ini? Pastikan tidak ada koleksi yang bergantung.')) return
    try {
      await categoryService.deleteCategory(id)
      toast.success('Kategori berhasil dihapus')
      fetchCategories()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus kategori')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Tags className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Manajemen Kategori Koleksi & Aset
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            Total {categories.length} kategori pengelompokan buku dan aset fisik perpustakaan
          </p>
        </div>

        {hasRole('admin', 'staff') && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md transition transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            Tambah Kategori Baru
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama kategori..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#122420] text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-sm"
        />
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 mx-auto border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs">Memuat daftar kategori...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white dark:bg-[#122420] rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <FolderOpen className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tidak ada kategori ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#122420] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-sand-100 dark:bg-sage-800 text-emerald-600 dark:text-emerald-400 font-bold">
                  <Tags className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                    {c.name}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    ID: #{c.id} • Koleksi Aktif
                  </span>
                </div>
              </div>

              {hasRole('admin', 'staff') && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(c)}
                    className="p-1.5 rounded-lg border border-sand-200 dark:border-sage-700 hover:bg-sand-100 dark:hover:bg-sage-800 text-slate-600 dark:text-slate-300 transition"
                    title="Edit Kategori"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-1.5 rounded-lg border border-sand-200 dark:border-sage-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 transition"
                    title="Hapus Kategori"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#122420] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm p-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              {editing ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Nama Kategori *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Contoh: Robotika & AI"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-sand-50/50 dark:bg-sage-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-sand-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold disabled:opacity-50 transition"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
