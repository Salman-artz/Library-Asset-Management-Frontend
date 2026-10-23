import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  BookOpen,
  Search,
  Plus,
  Barcode,
  SlidersHorizontal,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Layers,
  Printer,
  Sparkles,
  Cpu,
  RefreshCw
} from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost/library-aset-manajemen/public/api'

const STATUS_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: 'available', label: 'Tersedia' },
  { value: 'borrowed', label: 'Dipinjam' },
  { value: 'maintenance', label: 'Perbaikan' },
  { value: 'lost', label: 'Hilang' },
]

const CONDITION_OPTIONS = [
  { value: '', label: 'Semua Kondisi' },
  { value: 'good', label: 'Kondisi Baik' },
  { value: 'fair', label: 'Kondisi Cukup' },
  { value: 'damaged', label: 'Rusak / Servis' },
]

export default function Collections() {
  const { user, isAuthenticated, hasRole } = useAuth()
  const isMember = user?.role === 'member'

  const [collections, setCollections] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 })

  // Filters
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState('')
  const [condition, setCondition] = useState('')
  const [typeFilter, setTypeFilter] = useState('all') // 'all', 'books', 'assets'

  // Modals
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [barcodeModalItem, setBarcodeModalItem] = useState(null)
  const [form, setForm] = useState({
    code: '',
    title: '',
    category_id: '',
    total_stock: 1,
    condition: 'good',
    status: 'available',
    cover_image: null,
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchCollections = async (page = 1) => {
    setLoading(true)
    try {
      const params = { page, per_page: 12 }
      if (search) params.search = search
      if (categoryId) params.category_id = categoryId
      if (status) params.status = status
      if (condition) params.condition = condition

      const res = await api.get('/collections', { params })
      const d = res.data.data
      const collectionsData = Array.isArray(d) ? d : (d.data || [])
      setCollections(collectionsData)
      setPagination({
        currentPage: d.current_page || 1,
        lastPage: d.last_page || 1,
        total: d.total || collectionsData.length,
      })
    } catch (err) {
      toast.error('Gagal memuat katalog koleksi')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories')
      setCategories(res.data.data?.data || res.data.data || [])
    } catch (err) {
      // silent
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => fetchCollections(1), 300)
    return () => clearTimeout(timer)
  }, [search, categoryId, status, condition])

  const handlePageChange = (page) => fetchCollections(page)

  const openCreateModal = () => {
    setEditing(null)
    setForm({
      code: `ISBN-978-${Math.floor(100000000 + Math.random() * 900000000)}`,
      title: '',
      category_id: categories[0]?.id || '',
      total_stock: 3,
      condition: 'good',
      status: 'available',
      cover_image: null,
    })
    setShowModal(true)
  }

  const openEditModal = (col) => {
    setEditing(col)
    setForm({
      code: col.code,
      title: col.title,
      category_id: col.category_id,
      total_stock: col.total_stock,
      condition: col.condition,
      status: col.status,
      cover_image: null,
    })
    setShowModal(true)
  }

  const handleFormChange = (e) => {
    const { name, value, files } = e.target
    if (name === 'cover_image') {
      setForm({ ...form, cover_image: files[0] })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const handleGenerateCode = (type) => {
    if (type === 'isbn') {
      setForm(prev => ({ ...prev, code: `ISBN-978-${Math.floor(100000000 + Math.random() * 900000000)}` }))
    } else {
      setForm(prev => ({ ...prev, code: `AST-${Math.floor(1000 + Math.random() * 9000)}` }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('code', form.code)
      formData.append('title', form.title)
      formData.append('category_id', form.category_id)
      formData.append('total_stock', form.total_stock)
      formData.append('condition', form.condition)
      formData.append('status', form.status)
      if (form.cover_image) {
        formData.append('cover_image', form.cover_image)
      }

      if (editing) {
        formData.append('_method', 'PATCH')
        await api.post(`/collections/${editing.id}`, formData)
        toast.success('Koleksi berhasil diperbarui!')
      } else {
        await api.post('/collections', formData)
        toast.success('Koleksi baru berhasil ditambahkan!')
      }
      setShowModal(false)
      fetchCollections(pagination.currentPage)
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) {
        const first = Object.values(errors)[0]?.[0]
        toast.error(first || 'Gagal menyimpan data')
      } else {
        toast.error(err.response?.data?.message || 'Gagal menyimpan data')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus koleksi ini dari katalog inventaris?')) return
    try {
      await api.delete(`/collections/${id}`)
      toast.success('Koleksi berhasil dihapus')
      fetchCollections(pagination.currentPage)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus koleksi')
    }
  }

  const handleBorrow = async (collectionId, title) => {
    if (!isAuthenticated) {
      toast.error('Silakan login terlebih dahulu')
      return
    }
    if (!window.confirm(`Ajukan peminjaman buku/koleksi "${title}"?`)) return

    try {
      await api.post('/borrowings', {
        collection_id: collectionId,
        user_id: user.id,
      })
      toast.success('Peminjaman berhasil dicatat! Cek menu Peminjaman Saya.')
      fetchCollections(pagination.currentPage)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal meminjam')
    }
  }

  const getCoverUrl = (path) => {
    if (!path) return null
    if (path.startsWith('http')) return path
    return `${API_BASE.replace('/api', '')}/storage/${path}`
  }

  const filteredCollections = collections.filter(item => {
    if (typeFilter === 'books') {
      return item.code.includes('ISBN') || (item.category?.name !== 'Aset Kantor' && !item.code.startsWith('AST-'))
    }
    if (typeFilter === 'assets') {
      return item.code.startsWith('AST-') || item.category?.name === 'Aset Kantor'
    }
    return true
  })

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Katalog Koleksi & Inventaris Aset
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Total {pagination.total} koleksi terdaftar dalam basis data perpustakaan
          </p>
        </div>

        {hasRole('admin', 'staff') && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            Tambah Koleksi / Aset Baru
          </button>
        )}
      </div>

      {/* Quick ISBN & Type Filter Bar - High Contrast */}
      <div className="bg-white dark:bg-[#122420] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        {/* Type pills + quick sample searches */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-4">
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-[#0c1815] border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                typeFilter === 'all'
                  ? 'bg-white dark:bg-[#1a3832] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Semua Koleksi ({collections.length})
            </button>
            <button
              onClick={() => setTypeFilter('books')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                typeFilter === 'books'
                  ? 'bg-white dark:bg-[#1a3832] text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Buku & Literatur
            </button>
            <button
              onClick={() => setTypeFilter('assets')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                typeFilter === 'assets'
                  ? 'bg-white dark:bg-[#1a3832] text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Aset Fisik & TI
            </button>
          </div>

          {/* Quick test search presets */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Barcode className="w-3.5 h-3.5 text-emerald-600" />
              Tes Scan:
            </span>
            <button
              onClick={() => setSearch('Clean Code')}
              className="px-2.5 py-1 rounded-md text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-200 font-mono font-semibold border border-slate-200 dark:border-slate-700 transition"
            >
              Clean Code
            </button>
            <button
              onClick={() => setSearch('ISBN-978')}
              className="px-2.5 py-1 rounded-md text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-200 font-mono font-semibold border border-slate-200 dark:border-slate-700 transition"
            >
              ISBN-978
            </button>
            <button
              onClick={() => setSearch('AST-')}
              className="px-2.5 py-1 rounded-md text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-200 font-mono font-semibold border border-slate-200 dark:border-slate-700 transition"
            >
              AST-
            </button>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="px-2.5 py-1 rounded-md text-[11px] text-rose-600 hover:bg-rose-50 font-bold transition"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Inputs row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari ISBN, judul, atau kode aset..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0c1815] text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500 transition font-medium"
            />
          </div>

          <div>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0c1815] text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500 transition font-medium"
            >
              <option value="">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0c1815] text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500 transition font-medium"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0c1815] text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500 transition font-medium"
            >
              {CONDITION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Collections */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
          <p className="text-sm font-semibold">Menyelaraskan data katalog...</p>
        </div>
      ) : filteredCollections.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#122420] rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <BookOpen className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Tidak ada koleksi yang cocok
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian, nomor ISBN, atau bersihkan filter yang aktif.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredCollections.map((col) => {
            const isAsset = col.code.startsWith('AST-') || col.category?.name === 'Aset Kantor'
            return (
              <div
                key={col.id}
                className="group flex flex-col justify-between bg-white dark:bg-[#122420] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-500 transition overflow-hidden"
              >
                {/* Visual Header / Cover */}
                <div className="relative h-44 bg-gradient-to-br from-slate-100 via-slate-50 to-emerald-50 dark:from-[#0c1815] dark:via-[#11241f] dark:to-[#16302a] flex items-center justify-center p-4 border-b border-slate-100 dark:border-slate-800 overflow-hidden">
                  {getCoverUrl(col.cover_image_path) ? (
                    <img
                      src={getCoverUrl(col.cover_image_path)}
                      alt={col.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-4">
                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#1a3832] shadow flex items-center justify-center text-emerald-700 dark:text-emerald-400 mb-2 font-bold">
                        {isAsset ? <Cpu className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                      </div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold truncate max-w-[180px]">
                        {col.code}
                      </span>
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                        col.status === 'available'
                          ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                          : col.status === 'borrowed'
                          ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                          : 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {col.status === 'available' ? 'Tersedia' : col.status === 'borrowed' ? 'Dipinjam' : col.status}
                    </span>
                  </div>

                  <button
                    onClick={() => setBarcodeModalItem(col)}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-white dark:bg-[#1a3832] text-slate-700 dark:text-slate-200 hover:text-emerald-600 shadow border border-slate-200 dark:border-slate-700 transition"
                    title="Cetak Barcode Tag"
                  >
                    <Barcode className="w-4 h-4" />
                  </button>
                </div>

                {/* Content body */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 dark:text-emerald-400 font-bold mb-1">
                      <span>{col.category?.name || 'Umum'}</span>
                      <span>•</span>
                      <span className="font-mono text-slate-500">{isAsset ? 'Aset Fisik' : 'Buku'}</span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug">
                      {col.title}
                    </h3>
                    <p className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 mt-1 truncate">
                      {col.code}
                    </p>
                  </div>

                  {/* Stock meter */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 mb-1.5 font-medium">
                      <span className="text-[11px]">Ketersediaan</span>
                      <span className="font-mono font-bold">
                        {col.available_stock} / {col.total_stock} Unit
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.max(0, (col.available_stock / (col.total_stock || 1)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-4 flex items-center gap-2">
                    {col.status === 'available' && col.available_stock > 0 ? (
                      <button
                        onClick={() => handleBorrow(col.id, col.title)}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-sm transition"
                      >
                        Pinjam Cepat
                      </button>
                    ) : (
                      <span className="flex-1 text-center py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                        Tidak Tersedia
                      </span>
                    )}

                    {!isMember && hasRole('admin', 'staff') && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(col)}
                          className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
                          title="Edit Koleksi"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(col.id)}
                          className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-rose-50 text-rose-600 transition"
                          title="Hapus Koleksi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.lastPage > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1}
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 transition"
          >
            Sebelumnya
          </button>
          <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
            Halaman {pagination.currentPage} dari {pagination.lastPage}
          </span>
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.lastPage}
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 transition"
          >
            Selanjutnya
          </button>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#122420] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {editing ? 'Perbarui Data Koleksi' : 'Tambah Koleksi / Aset Perpustakaan'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Kode Identifikasi / Barcode / ISBN *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="code"
                    value={form.code}
                    onChange={handleFormChange}
                    required
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0c1815] text-slate-900 dark:text-white font-mono font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="ISBN-978-0132350884 atau AST-001"
                  />
                  <button
                    type="button"
                    onClick={() => handleGenerateCode('isbn')}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 text-slate-800 dark:text-slate-200 font-bold border border-slate-300 dark:border-slate-700"
                    title="Buat ISBN Acak"
                  >
                    + ISBN
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenerateCode('asset')}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 text-slate-800 dark:text-slate-200 font-bold border border-slate-300 dark:border-slate-700"
                    title="Buat Kode Aset"
                  >
                    + Aset
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Judul Koleksi / Nama Aset *
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0c1815] text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  placeholder="Contoh: Clean Architecture (Robert C. Martin)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Kategori *
                  </label>
                  <select
                    name="category_id"
                    value={form.category_id}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0c1815] text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Total Stok Unit *
                  </label>
                  <input
                    type="number"
                    min="1"
                    name="total_stock"
                    value={form.total_stock}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0c1815] text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Kondisi Fisik
                  </label>
                  <select
                    name="condition"
                    value={form.condition}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0c1815] text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    <option value="good">Baik</option>
                    <option value="fair">Cukup</option>
                    <option value="damaged">Rusak</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Status Sirkulasi
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0c1815] text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    <option value="available">Tersedia</option>
                    <option value="borrowed">Dipinjam</option>
                    <option value="maintenance">Perbaikan</option>
                    <option value="lost">Hilang</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-50 transition"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Koleksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barcode Tag Printable Modal */}
      {barcodeModalItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#122420] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm p-6 text-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 font-bold">
              <Barcode className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Label Barcode Inventaris
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Siap dicetak pada stiker thermal barcode
            </p>

            <div className="my-5 p-4 bg-white border-2 border-dashed border-slate-400 rounded-xl text-black">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-900">
                ARCHIVE & ASSET SYSTEM
              </div>
              <div className="text-xs font-bold mt-1 truncate text-slate-900">
                {barcodeModalItem.title}
              </div>
              {/* Simulated Barcode */}
              <div className="my-3 flex items-center justify-center h-12 bg-slate-950 px-4 rounded text-white tracking-[6px] font-mono text-sm">
                |||| | ||||| || |||
              </div>
              <div className="text-xs font-mono font-black tracking-widest text-slate-900">
                {barcodeModalItem.code}
              </div>
              <div className="text-[10px] text-slate-600 mt-1 font-semibold">
                Kategori: {barcodeModalItem.category?.name || 'Umum'} • Rak A-02
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setBarcodeModalItem(null)}
                className="flex-1 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  window.print()
                  toast.success('Perintah cetak dikirim ke printer label')
                }}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow"
              >
                <Printer className="w-3.5 h-3.5" />
                Cetak Label
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
