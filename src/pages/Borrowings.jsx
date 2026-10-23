import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  ArrowLeftRight,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Receipt,
  User,
  BookOpen,
  Eye,
  Filter,
  Check,
  ChevronRight
} from 'lucide-react'

const STATUS_LABELS = {
  borrowed: 'Sedang Dipinjam',
  returned: 'Telah Kembali',
  overdue: 'Terlambat',
  cancelled: 'Dibatalkan',
}

const STATUS_CLASSES = {
  borrowed: 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 font-bold',
  returned: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 font-bold',
  overdue: 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 font-bold',
  cancelled: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 font-bold',
}

export default function Borrowings() {
  const { user, hasRole } = useAuth()
  const isMember = user?.role === 'member'

  const [borrowings, setBorrowings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 })
  
  // Modals
  const [showDetail, setShowDetail] = useState(null)
  const [returnModal, setReturnModal] = useState(null)
  const [showFastCheckout, setShowFastCheckout] = useState(false)
  
  // Fast Checkout Form data
  const [availableCollections, setAvailableCollections] = useState([])
  const [memberOptions, setMemberOptions] = useState([])
  const [checkoutForm, setCheckoutForm] = useState({
    collection_id: '',
    user_id: user?.id || '',
    durationDays: 7,
  })
  const [submittingCheckout, setSubmittingCheckout] = useState(false)

  const fetchBorrowings = async (page = 1) => {
    setLoading(true)
    try {
      const params = { page, per_page: 10 }
      if (filter) params.status = filter
      // If member, backend scopes to their user_id automatically
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

  const loadCheckoutPrerequisites = async () => {
    try {
      const [colRes, memRes] = await Promise.allSettled([
        api.get('/collections', { params: { per_page: 50, status: 'available' } }),
        api.get('/reports/active-members'),
      ])

      if (colRes.status === 'fulfilled') {
        const cd = colRes.value.data.data
        const cList = Array.isArray(cd) ? cd : (cd?.data || [])
        setAvailableCollections(cList)
        if (cList.length > 0 && !checkoutForm.collection_id) {
          setCheckoutForm(prev => ({ ...prev, collection_id: cList[0].id }))
        }
      }

      let mList = []
      if (memRes.status === 'fulfilled') {
        const md = memRes.value.data.data
        mList = Array.isArray(md) ? md : (md?.data || [])
      }
      if (mList.length === 0) {
        mList = [
          { id: 4, name: 'Member Satu (member1@library.test)' },
          { id: 5, name: 'Member Dua (member2@library.test)' },
          { id: 6, name: 'Member Tiga (member3@library.test)' },
          { id: user?.id || 1, name: `${user?.name || 'Admin Library'} (Pribadi)` }
        ]
      }
      setMemberOptions(mList)
      if (!checkoutForm.user_id && mList.length > 0) {
        setCheckoutForm(prev => ({ ...prev, user_id: mList[0].id }))
      }
    } catch (err) {
      // ignore
    }
  }

  useEffect(() => {
    fetchBorrowings(1)
  }, [filter])

  const openFastCheckoutModal = () => {
    loadCheckoutPrerequisites()
    setShowFastCheckout(true)
  }

  const handleFastCheckoutSubmit = async (e) => {
    e.preventDefault()
    if (!checkoutForm.collection_id) {
      toast.error('Pilih koleksi buku/aset yang akan dipinjam')
      return
    }

    setSubmittingCheckout(true)
    try {
      await api.post('/borrowings', {
        collection_id: checkoutForm.collection_id,
        user_id: checkoutForm.user_id || user.id,
      })
      toast.success('Peminjaman kilat berhasil diproses!')
      setShowFastCheckout(false)
      fetchBorrowings(1)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memproses peminjaman')
    } finally {
      setSubmittingCheckout(false)
    }
  }

  const openReturnModal = (borrowing) => {
    const due = new Date(borrowing.due_date)
    const now = new Date()
    const diffTime = now - due
    const daysLate = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
    const dailyRate = 3000
    const calculatedFine = daysLate * dailyRate

    setReturnModal({
      borrowing,
      daysLate,
      dailyRate,
      calculatedFine,
      submitting: false,
    })
  }

  const confirmReturn = async () => {
    if (!returnModal) return
    setReturnModal(prev => ({ ...prev, submitting: true }))

    try {
      const res = await api.patch(`/borrowings/${returnModal.borrowing.id}/return`)
      const fineMsg = returnModal.calculatedFine > 0
        ? ` Pengembalian berhasil! Terlambat ${returnModal.daysLate} hari, denda Rp ${returnModal.calculatedFine.toLocaleString('id-ID')} dicatat.`
        : ' Pengembalian koleksi tepat waktu berhasil!'

      toast.success(res.data?.message || fineMsg)
      setReturnModal(null)
      fetchBorrowings(pagination.currentPage)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memproses pengembalian')
      setReturnModal(prev => ({ ...prev, submitting: false }))
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
    <div className="space-y-6 animate-fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <ArrowLeftRight className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            {isMember ? 'Riwayat Peminjaman Buku Saya' : 'Sirkulasi Peminjaman & Pengembalian'}
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {isMember
              ? `Total ${pagination.total} riwayat sirkulasi pada akun Anda`
              : `Total ${pagination.total} transaksi sirkulasi aktif & terekam`}
          </p>
        </div>

        {!isMember && hasRole('admin', 'staff') && (
          <button
            onClick={openFastCheckoutModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            Fast Check-out (Peminjaman Cepat)
          </button>
        )}
      </div>

      {/* Filter Tabs & Status Overview - High Contrast */}
      <div className="bg-white dark:bg-[#122420] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Filter:
          </span>
          {[
            { key: '', label: 'Semua Status' },
            { key: 'borrowed', label: 'Sedang Dipinjam' },
            { key: 'returned', label: 'Dikembalikan' },
            { key: 'overdue', label: 'Terlambat' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                filter === tab.key
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-400 font-mono font-medium">
          Tarif Denda Otomatis: <span className="font-bold text-emerald-700 dark:text-emerald-400">Rp 3.000 / hari</span>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-[#122420] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="w-8 h-8 mx-auto border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-xs font-bold">Memuat riwayat transaksi sirkulasi...</p>
          </div>
        ) : borrowings.length === 0 ? (
          <div className="py-16 text-center text-slate-400 p-6">
            <ArrowLeftRight className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {isMember ? 'Anda belum memiliki pinjaman aktif' : 'Tidak ada data transaksi peminjaman'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isMember
                ? 'Kunjungi katalog koleksi untuk meminjam buku pilihan Anda.'
                : 'Gunakan tombol Fast Check-out untuk membuat peminjaman baru.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-[#0c1815] text-slate-700 dark:text-slate-200 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3.5 px-5">Koleksi Buku / Aset</th>
                  {!isMember && <th className="py-3.5 px-5">Peminjam</th>}
                  <th className="py-3.5 px-5">Waktu Pinjam</th>
                  <th className="py-3.5 px-5">Jatuh Tempo</th>
                  <th className="py-3.5 px-5">Pengembalian</th>
                  <th className="py-3.5 px-5 text-center">Status</th>
                  <th className="py-3.5 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {borrowings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-900 dark:text-white max-w-[220px] truncate">
                        {b.collection?.title || 'Koleksi Tanpa Judul'}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 font-semibold mt-0.5">
                        {b.collection?.code || `ID: #${b.id}`}
                      </div>
                    </td>

                    {!isMember && (
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {b.user?.name || 'Member'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {b.user?.email || 'member@library.test'}
                        </div>
                      </td>
                    )}

                    <td className="py-3.5 px-5 font-mono text-slate-700 dark:text-slate-300 font-medium">
                      {formatDate(b.borrowed_at)}
                    </td>

                    <td className="py-3.5 px-5 font-mono text-slate-700 dark:text-slate-300 font-bold">
                      {formatDate(b.due_date)}
                    </td>

                    <td className="py-3.5 px-5 font-mono text-slate-600 dark:text-slate-400">
                      {b.returned_at ? formatDateTime(b.returned_at) : (
                        <span className="text-amber-700 dark:text-amber-400 font-sans text-[11px] font-bold">Belum Kembali</span>
                      )}
                    </td>

                    <td className="py-3.5 px-5 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide ${STATUS_CLASSES[b.status] || STATUS_CLASSES.borrowed}`}>
                        {STATUS_LABELS[b.status] || b.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setShowDetail(b)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold transition"
                          title="Lihat Detail Transaksi"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {!isMember && hasRole('admin', 'staff') && (b.status === 'borrowed' || b.status === 'overdue') && (
                          <button
                            onClick={() => openReturnModal(b)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm transition"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Kembalikan
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.lastPage > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-600 font-mono font-bold">
              Halaman {pagination.currentPage} dari {pagination.lastPage} ({pagination.total} total data)
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => fetchBorrowings(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 font-bold"
              >
                Prev
              </button>
              <button
                onClick={() => fetchBorrowings(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.lastPage}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 font-bold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fast Check-out Modal */}
      {showFastCheckout && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#122420] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-600" />
                  Fast Check-out (Peminjaman Cepat)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Proses registrasi sirkulasi instan dengan barcode/katalog
                </p>
              </div>
              <button
                onClick={() => setShowFastCheckout(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFastCheckoutSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Pilih Koleksi Buku / Aset Fisik *
                </label>
                <select
                  value={checkoutForm.collection_id}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, collection_id: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0c1815] text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  <option value="">-- Pilih Koleksi Tersedia --</option>
                  {availableCollections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.title} (Sisa Stok: {c.available_stock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Pilih Member Peminjam *
                </label>
                <select
                  value={checkoutForm.user_id}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, user_id: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0c1815] text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  {memberOptions.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Durasi Peminjaman Standar
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { days: 7, label: '7 Hari (Standar)' },
                    { days: 14, label: '14 Hari (Penelitian)' },
                    { days: 30, label: '30 Hari (Dosen/Staff)' },
                  ].map((preset) => (
                    <button
                      key={preset.days}
                      type="button"
                      onClick={() => setCheckoutForm({ ...checkoutForm, durationDays: preset.days })}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border text-center transition ${
                        checkoutForm.durationDays === preset.days
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white dark:bg-[#0c1815] border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#0c1815] border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400 space-y-1 font-medium">
                <p>• Jatuh tempo otomatis dihitung sejak tanggal check-out.</p>
                <p>• Notifikasi pengingat via email dikirim H-1 sebelum jatuh tempo.</p>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFastCheckout(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingCheckout}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-50 transition"
                >
                  {submittingCheckout ? 'Memproses...' : 'Konfirmasi Check-out'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1-Click Return & Fine Calculation Modal */}
      {returnModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#122420] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 font-bold">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white text-center">
              Konfirmasi Pengembalian Koleksi
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 text-center mt-1">
              Validasi fisik barang & kalkulasi denda keterlambatan otomatis
            </p>

            <div className="my-5 p-4 rounded-xl bg-slate-50 dark:bg-[#0c1815] border border-slate-200 dark:border-slate-700 text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Judul Koleksi:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-right max-w-[200px] truncate">
                  {returnModal.borrowing.collection?.title}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Peminjam:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {returnModal.borrowing.user?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Jatuh Tempo:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {formatDate(returnModal.borrowing.due_date)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Tanggal Sekarang:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {formatDate(new Date())}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="font-bold text-slate-800 dark:text-slate-200">Keterlambatan:</span>
                <span className={`font-mono font-black ${returnModal.daysLate > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {returnModal.daysLate > 0 ? `${returnModal.daysLate} Hari Terlambat` : 'Tepat Waktu (0 Hari)'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800 dark:text-slate-200">Total Denda:</span>
                <span className="font-mono text-base font-black text-emerald-600 dark:text-emerald-400">
                  {returnModal.calculatedFine > 0
                    ? `Rp ${returnModal.calculatedFine.toLocaleString('id-ID')}`
                    : 'Rp 0 (Bebas Denda)'}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setReturnModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={returnModal.submitting}
                onClick={confirmReturn}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow transition disabled:opacity-50"
              >
                {returnModal.submitting ? 'Memproses...' : 'Konfirmasi Kembali'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#122420] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">
              Detail Transaksi Sirkulasi #{showDetail.id}
            </h2>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0c1815] border border-slate-200 dark:border-slate-700 space-y-1.5">
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  {showDetail.collection?.title}
                </p>
                <p className="font-mono text-slate-500 text-[11px] font-semibold">
                  Kode: {showDetail.collection?.code}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-200">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0c1815] border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Peminjam</span>
                  <span className="font-bold">{showDetail.user?.name}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0c1815] border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Status</span>
                  <span className="font-bold capitalize">{showDetail.status}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0c1815] border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Tanggal Pinjam</span>
                  <span className="font-mono font-semibold">{formatDate(showDetail.borrowed_at)}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0c1815] border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Jatuh Tempo</span>
                  <span className="font-mono font-semibold">{formatDate(showDetail.due_date)}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
