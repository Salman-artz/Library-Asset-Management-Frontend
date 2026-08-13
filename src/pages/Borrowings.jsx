import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const STATUS_LABELS = {
  borrowed: 'Dipinjam',
  returned: 'Dikembalikan',
  overdue: 'Terlambat',
  cancelled: 'Dibatalkan',
}

const STATUS_COLORS = {
  borrowed: 'bg-blue-100 text-blue-800',
  returned: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

export default function Borrowings() {
  const { user, hasRole } = useAuth()
  const [borrowings, setBorrowings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 })
  const [showDetail, setShowDetail] = useState(null)

  const fetchBorrowings = async (page = 1) => {
    setLoading(true)
    try {
      const params = { page, per_page: 10 }
      if (filter) params.status = filter

      const res = await api.get('/borrowings', { params })
      const d = res.data.data
      const borrowingsData = Array.isArray(d) ? d : (d.data || [])
      setBorrowings(borrowingsData)
      setPagination({
        currentPage: d.current_page || 1,
        lastPage: d.last_page || 1,
        total: d.total || borrowingsData.length,
      })
    } catch (err) {
      toast.error('Gagal memuat data peminjaman')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBorrowings() }, [filter])

  const handleReturn = async (id) => {
    if (!confirm('Proses pengembalian koleksi ini?')) return
    try {
      const res = await api.patch(`/borrowings/${id}/return`)
      const msg = res.data.message || 'Pengembalian berhasil diproses'
      toast.success(msg)
      fetchBorrowings(pagination.currentPage)
      setShowDetail(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memproses pengembalian')
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('id-ID', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Peminjaman</h1>
          <p className="text-sm text-gray-500 mt-1">Total {pagination.total} peminjaman</p>
        </div>
        <div className="flex gap-2">
          {['', 'borrowed', 'returned', 'overdue'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                filter === s
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s ? STATUS_LABELS[s] : 'Semua'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {borrowings.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-lg">Belum ada data peminjaman</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Koleksi</th>
                    {hasRole('admin', 'staff') && (
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Peminjam</th>
                    )}
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Tgl Pinjam</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Jatuh Tempo</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Tgl Kembali</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {borrowings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-gray-900">{b.collection?.title || '-'}</p>
                        <p className="text-xs text-gray-500">{b.collection?.code || ''}</p>
                      </td>
                      {hasRole('admin', 'staff') && (
                        <td className="px-4 py-4 text-sm text-gray-700">{b.user?.name || '-'}</td>
                      )}
                      <td className="px-4 py-4 text-sm text-gray-600">{formatDate(b.borrowed_at)}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{formatDate(b.due_date)}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{formatDateTime(b.returned_at)}</td>
                      <td className="px-4 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[b.status]}`}>
                          {STATUS_LABELS[b.status] || b.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => setShowDetail(b)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Detail
                        </button>
                        {hasRole('admin', 'staff') && (b.status === 'borrowed' || b.status === 'overdue') && (
                          <button
                            onClick={() => handleReturn(b.id)}
                            className="ml-2 text-xs text-green-600 hover:text-green-800 font-medium"
                          >
                            Kembalikan
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {pagination.lastPage > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <button
                onClick={() => fetchBorrowings(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
              >
                Prev
              </button>
              <span className="text-sm text-gray-500">
                Halaman {pagination.currentPage} dari {pagination.lastPage}
              </span>
              <button
                onClick={() => fetchBorrowings(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.lastPage}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Detail Peminjaman</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Koleksi</p>
                  <p className="font-medium text-gray-900">{showDetail.collection?.title || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Kode</p>
                  <p className="font-medium text-gray-900">{showDetail.collection?.code || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Peminjam</p>
                  <p className="font-medium text-gray-900">{showDetail.user?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[showDetail.status]}`}>
                    {STATUS_LABELS[showDetail.status] || showDetail.status}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500">Tanggal Pinjam</p>
                  <p className="font-medium">{formatDateTime(showDetail.borrowed_at)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Jatuh Tempo</p>
                  <p className="font-medium">{formatDate(showDetail.due_date)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Tanggal Kembali</p>
                  <p className="font-medium">{formatDateTime(showDetail.returned_at)}</p>
                </div>
              </div>
              {showDetail.fine && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm font-medium text-red-800">Denda</p>
                  <p className="text-sm text-red-700 mt-1">
                    Rp {parseInt(showDetail.fine.amount).toLocaleString('id-ID')} ({showDetail.fine.days_late} hari telat)
                  </p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    showDetail.fine.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {showDetail.fine.status === 'paid' ? 'Lunas' : 'Belum Dibayar'}
                  </span>
                </div>
              )}
              {hasRole('admin', 'staff') && (showDetail.status === 'borrowed' || showDetail.status === 'overdue') && (
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => { handleReturn(showDetail.id); }}
                    className="w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition"
                  >
                    Proses Pengembalian
                  </button>
                </div>
              )}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowDetail(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
