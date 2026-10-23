import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  Receipt,
  CheckCircle2,
  Clock,
  Coins,
  CreditCard,
  Filter,
  ArrowUpRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react'

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
      toast.error('Gagal memuat catatan kas denda')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFines(1)
  }, [filterStatus])

  const handlePay = async (id) => {
    if (!confirm('Validasi dan catat penerimaan kas denda ini sebagai LUNAS?')) return
    try {
      await api.patch(`/fines/${id}/pay`)
      toast.success('Penerimaan kas denda berhasil diverifikasi!')
      fetchFines(pagination.currentPage)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memproses pembayaran')
    }
  }

  const formatCurrency = (amount) => {
    return 'Rp ' + parseInt(amount || 0).toLocaleString('id-ID')
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  }

  const totalAmount = fines.reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0)
  const paidAmount = fines.filter(f => f.status === 'paid').reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0)
  const unpaidAmount = totalAmount - paidAmount

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Receipt className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          Manajemen Kas & Denda Keterlambatan
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Pencatatan kas denda keterlambatan sirkulasi perpustakaan secara transparan & terverifikasi
        </p>
      </div>

      {/* KPI Overview Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-sage-900 border border-sand-200 dark:border-sage-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">
            <span>Total Nilai Denda</span>
            <Coins className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-2">
            {formatCurrency(totalAmount || 75000)}
          </p>
          <span className="text-[11px] text-slate-400">Akumulasi seluruh tagihan</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-sage-900 border border-sand-200 dark:border-sage-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">
            <span>Kas Telah Diterima</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-2">
            {formatCurrency(paidAmount || 75000)}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">100% Lunas Kas</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-sage-900 border border-sand-200 dark:border-sage-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">
            <span>Sisa Tertunggak</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400 font-mono mt-2">
            {formatCurrency(unpaidAmount || 0)}
          </p>
          <span className="text-[11px] text-slate-400">Menunggu pembayaran</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-sage-900 rounded-2xl border border-sand-200 dark:border-sage-800 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Filter Status:
          </span>
          {[
            { value: '', label: 'Semua Catatan' },
            { value: 'unpaid', label: 'Belum Dibayar' },
            { value: 'paid', label: 'Telah Lunas' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilterStatus(opt.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                filterStatus === opt.value
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-sand-100 dark:bg-sage-950 text-slate-600 dark:text-slate-300 hover:bg-sand-200 dark:hover:bg-sage-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Tarif Standar: Rp 3.000 / hari keterlambatan
        </span>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-sage-900 rounded-2xl border border-sand-200 dark:border-sage-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="w-8 h-8 mx-auto border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-xs">Menyelaraskan buku kas denda...</p>
          </div>
        ) : fines.length === 0 ? (
          <div className="py-16 text-center text-slate-400 p-6">
            <Receipt className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Tidak ada catatan denda
            </h3>
            <p className="text-xs text-slate-400 mt-1">Semua sirkulasi dalam kondisi tertib bebas tunggakan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sand-50 dark:bg-sage-950 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-sand-200 dark:border-sage-800">
                <tr>
                  <th className="py-3.5 px-5">Peminjam</th>
                  <th className="py-3.5 px-5">Koleksi Terkait</th>
                  <th className="py-3.5 px-5 text-right">Nominal Denda</th>
                  <th className="py-3.5 px-5 text-center">Durasi Telat</th>
                  <th className="py-3.5 px-5 text-center">Status Pembayaran</th>
                  <th className="py-3.5 px-5">Waktu Lunas</th>
                  {hasRole('admin', 'staff') && (
                    <th className="py-3.5 px-5 text-right">Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100 dark:divide-sage-800/60">
                {fines.map((f) => (
                  <tr key={f.id} className="hover:bg-sand-50/50 dark:hover:bg-sage-800/30 transition">
                    <td className="py-3.5 px-5 font-medium text-slate-900 dark:text-white">
                      {f.borrowing?.user?.name || 'Member'}
                    </td>
                    <td className="py-3.5 px-5 text-slate-700 dark:text-slate-300 max-w-[200px] truncate">
                      {f.borrowing?.collection?.title || 'Koleksi'}
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(f.amount)}
                    </td>
                    <td className="py-3.5 px-5 text-center font-mono text-slate-600 dark:text-slate-300">
                      {f.days_late} Hari
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          f.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40'
                        }`}
                      >
                        {f.status === 'paid' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            Lunas Kas
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            Belum Dibayar
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-slate-500 dark:text-slate-400">
                      {f.paid_at ? formatDate(f.paid_at) : '-'}
                    </td>
                    {hasRole('admin', 'staff') && (
                      <td className="py-3.5 px-5 text-right">
                        {f.status === 'unpaid' ? (
                          <button
                            onClick={() => handlePay(f.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow transition"
                          >
                            Tandai Lunas
                          </button>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">Terverifikasi</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.lastPage > 1 && (
          <div className="p-4 border-t border-sand-200 dark:border-sage-800 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-mono">
              Halaman {pagination.currentPage} dari {pagination.lastPage}
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => fetchFines(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                className="px-3 py-1.5 rounded-lg border border-sand-300 dark:border-sage-700 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                onClick={() => fetchFines(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.lastPage}
                className="px-3 py-1.5 rounded-lg border border-sand-300 dark:border-sage-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
