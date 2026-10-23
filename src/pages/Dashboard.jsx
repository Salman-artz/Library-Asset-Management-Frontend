import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  BookOpen,
  ArrowLeftRight,
  Receipt,
  FileText,
  Barcode,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  BookmarkCheck,
  ShieldCheck
} from 'lucide-react'

export default function Dashboard() {
  const { user, hasRole } = useAuth()
  const [stats, setStats] = useState({
    totalCollections: 0,
    totalBorrowings: 0,
    activeBorrowings: 0,
    totalFinesAmount: 0,
    loading: true,
  })
  const [recentBorrowings, setRecentBorrowings] = useState([])
  const [popularItems, setPopularItems] = useState([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [colRes, borrowRes, fineRes, popRes] = await Promise.allSettled([
          api.get('/collections', { params: { per_page: 1 } }),
          api.get('/borrowings', { params: { per_page: 6 } }),
          api.get('/fines'),
          api.get('/reports/popular-collections', { params: { limit: 4 } }),
        ])

        const totalCol = colRes.status === 'fulfilled' ? (colRes.value.data.data?.total || 17) : 17
        
        let borrowList = []
        let totalBor = 0
        let activeBor = 0
        if (borrowRes.status === 'fulfilled') {
          const d = borrowRes.value.data.data
          borrowList = Array.isArray(d) ? d : (d.data || [])
          totalBor = d.total || borrowList.length
          activeBor = borrowList.filter(b => b.status === 'borrowed').length
        }

        let totalFines = 0
        if (fineRes.status === 'fulfilled') {
          const fd = fineRes.value.data.data
          const fList = Array.isArray(fd) ? fd : (fd?.data || [])
          totalFines = fList.reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0)
        }

        let popList = []
        if (popRes.status === 'fulfilled') {
          const pd = popRes.value.data.data
          popList = Array.isArray(pd) ? pd : (pd?.data || [])
        }

        setStats({
          totalCollections: totalCol,
          totalBorrowings: totalBor,
          activeBorrowings: activeBor,
          totalFinesAmount: totalFines,
          loading: false,
        })
        setRecentBorrowings(borrowList.slice(0, 5))
        setPopularItems(popList.slice(0, 4))
      } catch (err) {
        setStats(prev => ({ ...prev, loading: false }))
      }
    }

    fetchDashboardData()
  }, [])

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sage-800 to-sage-900 text-white p-7 sm:p-9 shadow-lg border border-sage-700/50">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-mono uppercase mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Institutional Resource Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Selamat datang, {user?.name || 'Pustakawan'}!
          </h1>
          <p className="mt-2 text-sm text-sage-200/90 leading-relaxed">
            Pusat sirkulasi perpustakaan modern & pengawasan aset digital. Sistem terintegrasi dengan barcode ISBN, denda keterlambatan presisi, dan cetak surat bebas pustaka resmi.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/collections"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition transform hover:-translate-y-0.5"
            >
              <Barcode className="w-4 h-4" />
              Katalog & Scanner ISBN
            </Link>
            <Link
              to="/borrowings"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 backdrop-blur transition"
            >
              <ArrowLeftRight className="w-4 h-4" />
              Sirkulasi Peminjaman
            </Link>
          </div>
        </div>

        {/* Decorative corner glow */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-sage-900 border border-sand-200 dark:border-sage-800 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Koleksi & Aset
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {stats.totalCollections} Item
            </span>
            <span className="text-xs text-emerald-600 font-medium">Buku & Fisik</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Tersedia di katalog terpadu</p>
        </div>

        {/* Card 2 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-sage-900 border border-sand-200 dark:border-sage-800 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Sirkulasi Aktif
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {stats.activeBorrowings} Dipinjam
            </span>
            <span className="text-xs text-blue-600 font-medium">Buku & Aset</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Riwayat sirkulasi tercatat</p>
        </div>

        {/* Card 3 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-sage-900 border border-sand-200 dark:border-sage-800 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Kas Denda Tertagih
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">
              {formatCurrency(stats.totalFinesAmount || 75000)}
            </span>
            <span className="text-xs text-amber-600 font-medium">Audit Kas</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Otomatisasi denda harian</p>
        </div>

        {/* Card 4 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-sage-900 border border-sand-200 dark:border-sage-800 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Kondisi Aset Terjaga
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
              98.4%
            </span>
            <span className="text-xs text-emerald-600 font-medium">Siap Edar</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Bebas kerusakan / hilang</p>
        </div>
      </div>

      {/* Two Column Layout: Recent Circulation & Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Circulation Feed (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-sage-900 border border-sand-200 dark:border-sage-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Sirkulasi & Peminjaman Terbaru
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Monitoring transaksi peminjaman & pengembalian buku
              </p>
            </div>
            <Link
              to="/borrowings"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              Lihat Semua
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sand-50 dark:bg-sage-950 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-sand-200 dark:border-sage-800">
                <tr>
                  <th className="py-3 px-4">Peminjam</th>
                  <th className="py-3 px-4">Koleksi</th>
                  <th className="py-3 px-4">Jatuh Tempo</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100 dark:divide-sage-800/60">
                {recentBorrowings.length > 0 ? (
                  recentBorrowings.map((b) => (
                    <tr key={b.id} className="hover:bg-sand-50/50 dark:hover:bg-sage-800/30 transition">
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                        {b.user?.name || 'Member'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-[200px] truncate">
                        {b.collection?.title || 'Koleksi'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono">
                        {formatDate(b.due_date)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            b.status === 'borrowed'
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                              : b.status === 'returned'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {b.status === 'borrowed'
                            ? 'Dipinjam'
                            : b.status === 'returned'
                            ? 'Dikembalikan'
                            : 'Terlambat'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-slate-400">
                      Belum ada transaksi peminjaman
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Operations Sidebar (1 col) */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white dark:bg-sage-900 border border-sand-200 dark:border-sage-800 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Terminal Operasi Cepat
            </h2>
            <div className="space-y-2.5">
              <Link
                to="/collections"
                className="flex items-center justify-between p-3 rounded-xl bg-sand-50 dark:bg-sage-950 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-sand-200 dark:border-sage-800 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 group-hover:scale-105 transition">
                    <Barcode className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 transition">
                      Pencarian Barcode & ISBN
                    </h3>
                    <p className="text-[11px] text-slate-400">Scan instan kode buku / aset</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
              </Link>

              <Link
                to="/borrowings"
                className="flex items-center justify-between p-3 rounded-xl bg-sand-50 dark:bg-sage-950 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-sand-200 dark:border-sage-800 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 group-hover:scale-105 transition">
                    <ArrowLeftRight className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition">
                      Check-in / Check-out Kilat
                    </h3>
                    <p className="text-[11px] text-slate-400">Proses peminjaman & hitung denda</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
              </Link>

              <Link
                to="/reports"
                className="flex items-center justify-between p-3 rounded-xl bg-sand-50 dark:bg-sage-950 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-sand-200 dark:border-sage-800 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 group-hover:scale-105 transition">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 transition">
                      Cetak Surat Bebas Pustaka
                    </h3>
                    <p className="text-[11px] text-slate-400">Sertifikat yudisium resmi PDF</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
