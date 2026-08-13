import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Fines() {
  const { hasRole } = useAuth()
  const [fines, setFines] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 })

  const fetchFines = async (page = 1) => {
    setLoading(true)
    try {
      const params = { page, per_page: 10 }
      if (filterStatus) params.status = filterStatus
      const endpoint = hasRole('admin', 'staff') ? '/fines' : '/fines/mine'
      const res = await api.get(endpoint, { params })
      const d = res.data.data
      const finesData = Array.isArray(d) ? d : (d.data || [])
      setFines(finesData)
      setPagination({
        currentPage: d.current_page || 1,
        lastPage: d.last_page || 1,
        total: d.total || finesData.length,
      })
    } catch (err) {
      toast.error('Gagal memuat data denda')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchFines() }, [filterStatus])

  const handlePay = async (id) => {
    if (!confirm('Tandai denda ini sebagai LUNAS?')) return
    try {
      await api.patch(`/fines/${id}/pay`)
      toast.success('Pembayaran denda berhasil dicatat')
      fetchFines(pagination.currentPage)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memproses pembayaran')
    }
  }

  const formatCurrency = (amount) => {
    return 'Rp ' + parseInt(amount).toLocaleString('id-ID')
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Denda</h1>
          <p className="text-sm text-gray-500 mt-1">Total {pagination.total} denda</p>
        </div>
        <div className="flex gap-2">
          {[
            { value: '', label: 'Semua' },
            { value: 'unpaid', label: 'Belum Dibayar' },
            { value: 'paid', label: 'Lunas' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilterStatus(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                filterStatus === opt.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {opt.label}
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
            {fines.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg">Tidak ada data denda</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Peminjam</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Koleksi</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Hari Telat</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Tgl Bayar</th>
                    {hasRole('admin', 'staff') && (
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {fines.map((f) => (
                    <tr key={f.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-4 text-sm text-gray-900">{f.borrowing?.user?.name || '-'}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{f.borrowing?.collection?.title || '-'}</td>
                      <td className="px-4 py-4 text-sm text-right font-medium text-red-600">
                        {formatCurrency(f.amount)}
                      </td>
                      <td className="px-4 py-4 text-sm text-center text-gray-600">{f.days_late} hari</td>
                      <td className="px-4 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          f.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {f.status === 'paid' ? 'Lunas' : 'Belum Dibayar'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-center text-gray-600">{formatDate(f.paid_at)}</td>
                      {hasRole('admin', 'staff') && (
                        <td className="px-4 py-4 text-right">
                          {f.status === 'unpaid' && (
                            <button
                              onClick={() => handlePay(f.id)}
                              className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition"
                            >
                              Bayar
                            </button>
                          )}
                          {f.status === 'paid' && (
                            <span className="text-xs text-gray-400">Lunas</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {pagination.lastPage > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <button
                onClick={() => fetchFines(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
              >
                Prev
              </button>
              <span className="text-sm text-gray-500">
                Halaman {pagination.currentPage} dari {pagination.lastPage}
              </span>
              <button
                onClick={() => fetchFines(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.lastPage}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
