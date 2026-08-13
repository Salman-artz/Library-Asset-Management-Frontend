import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

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
  { value: 'good', label: 'Baik' },
  { value: 'fair', label: 'Cukup' },
  { value: 'damaged', label: 'Rusak' },
]

export default function Collections() {
  const { user, isAuthenticated, hasRole } = useAuth()
  const [collections, setCollections] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 })

  // Filters
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState('')
  const [condition, setCondition] = useState('')

  // Modal
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
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
      toast.error('Gagal memuat koleksi')
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

  useEffect(() => { fetchCategories() }, [])

  useEffect(() => {
    const timer = setTimeout(() => fetchCollections(1), 300)
    return () => clearTimeout(timer)
  }, [search, categoryId, status, condition])

  const handlePageChange = (page) => fetchCollections(page)

  const openCreateModal = () => {
    setEditing(null)
    setForm({ code: '', title: '', category_id: '', total_stock: 1, condition: 'good', status: 'available', cover_image: null })
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
        toast.success('Koleksi berhasil diperbarui')
      } else {
        await api.post('/collections', formData)
        toast.success('Koleksi berhasil ditambahkan')
      }
      setShowModal(false)
      fetchCollections(pagination.currentPage)
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) {
        const first = Object.values(errors)[0]?.[0]
        toast.error(first || 'Gagal menyimpan koleksi')
      } else {
        toast.error(err.response?.data?.message || 'Gagal menyimpan koleksi')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus koleksi ini?')) return
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
    
    if (!window.confirm(`Apakah Anda yakin ingin meminjam koleksi "${title}"?`)) {
      return
    }

    try {
      await api.post('/borrowings', {
        collection_id: collectionId,
        user_id: user.id,
      })
      toast.success('Peminjaman berhasil!')
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

  const getStatusBadge = (s) => {
    const colors = {
      available: 'bg-green-100 text-green-800',
      borrowed: 'bg-yellow-100 text-yellow-800',
      maintenance: 'bg-red-100 text-red-800',
      lost: 'bg-gray-100 text-gray-800',
    }
    return colors[s] || 'bg-gray-100 text-gray-800'
  }

  const getConditionBadge = (c) => {
    const colors = {
      good: 'bg-green-100 text-green-800',
      fair: 'bg-blue-100 text-blue-800',
      damaged: 'bg-red-100 text-red-800',
    }
    return colors[c] || 'bg-gray-100 text-gray-800'
  }

  const statusLabels = { available: 'Tersedia', borrowed: 'Dipinjam', maintenance: 'Perbaikan', lost: 'Hilang' }
  const conditionLabels = { good: 'Baik', fair: 'Cukup', damaged: 'Rusak' }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Katalog Koleksi</h1>
          <p className="text-sm text-gray-500 mt-1">Total {pagination.total} koleksi</p>
        </div>
        {hasRole('admin', 'staff') && (
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Tambah Koleksi</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Cari</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul atau kode..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Kategori</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              <option value="">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Kondisi</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              {CONDITION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* Collection Grid */}
      {!loading && (
        <>
          {collections.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-lg">Tidak ada koleksi ditemukan</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {collections.map((col) => (
                <div key={col.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                  {/* Cover Image */}
                  <div className="h-40 bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center overflow-hidden">
                    {getCoverUrl(col.cover_image_path) ? (
                      <img
                        src={getCoverUrl(col.cover_image_path)}
                        alt={col.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-16 h-16 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{col.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{col.code}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(col.status)}`}>
                        {statusLabels[col.status] || col.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getConditionBadge(col.condition)}`}>
                        {conditionLabels[col.condition] || col.condition}
                      </span>
                    </div>

                    {col.category && (
                      <p className="text-xs text-gray-500 mt-2">
                        <span className="font-medium">Kategori:</span> {col.category.name}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span>Stok: {col.available_stock}/{col.total_stock}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                      {col.status === 'available' && col.available_stock > 0 && (
                        <button
                          onClick={() => handleBorrow(col.id, col.title)}
                          className="flex-1 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition"
                        >
                          Pinjam
                        </button>
                      )}
                      {col.status !== 'available' && (
                        <span className="flex-1 text-center text-xs text-gray-400 py-1.5">
                          {col.status === 'borrowed' ? 'Sedang dipinjam' : 'Tidak tersedia'}
                        </span>
                      )}
                      {hasRole('admin', 'staff') && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEditModal(col)}
                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(col.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                            title="Hapus"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.lastPage > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
              >
                Prev
              </button>
              {Array.from({ length: pagination.lastPage }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition ${
                    page === pagination.currentPage
                      ? 'bg-indigo-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.lastPage}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editing ? 'Edit Koleksi' : 'Tambah Koleksi Baru'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kode Koleksi *</label>
                  <input
                    type="text"
                    name="code"
                    value={form.code}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="ex: BK-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
                  <select
                    name="category_id"
                    value={form.category_id}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Koleksi *</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Nama koleksi"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Stok *</label>
                  <input
                    type="number"
                    name="total_stock"
                    value={form.total_stock}
                    onChange={handleFormChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kondisi</label>
                  <select
                    name="condition"
                    value={form.condition}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="good">Baik</option>
                    <option value="fair">Cukup</option>
                    <option value="damaged">Rusak</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="available">Tersedia</option>
                    <option value="maintenance">Perbaikan</option>
                    <option value="lost">Hilang</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Cover</label>
                <input
                  type="file"
                  name="cover_image"
                  onChange={handleFormChange}
                  accept="image/*"
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-lg transition"
                >
                  {submitting ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Tambah Koleksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
