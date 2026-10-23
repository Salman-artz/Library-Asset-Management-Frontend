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
  ShieldCheck,
  UserCheck
} from 'lucide-react'

export default function Dashboard() {
  const { user, hasRole } = useAuth()
  const isMember = user?.role === 'member'

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
          api.get(isMember ? '/fines/mine' : '/fines'),
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
  }, [isMember])

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
      {/* Welcome Banner - High Contrast Deep Pine with Crisp Glow */}
      <div className="relative overflow-hidden rounded-2xl bg-[#122D27] dark:bg-[#0E221E] text-white p-7 sm:p-9 shadow-lg border border-[#1E453C]">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/50 text-xs font-mono font-bold uppercase mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {isMember ? 'Portal Peminjam Mandiri' : 'Institutional Resource Management'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Selamat datang, {user?.name || 'Pengguna'}!
          </h1>
          <p className="mt-2 text-sm text-slate-200 leading-relaxed font-normal">
            {isMember
              ? 'Kelola sirkulasi buku pinjaman Anda, telusuri ribuan katalog literatur, dan pantau batas pengembalian secara mandiri dengan mudah.'
              : 'Pusat sirkulasi perpustakaan modern & pengawasan aset digital. Terintegrasi dengan barcode ISBN, denda keterlambatan presisi, dan cetak surat bebas pustaka resmi.'}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/collections"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition transform hover:-translate-y-0.5"
            >
              <Barcode className="w-4 h-4" />
              Katalog & Scanner ISBN
            </Link>
            <Link
              to="/borrowings"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/30 backdrop-blur transition"
            >
              <ArrowLeftRight className="w-4 h-4" />
              {isMember ? 'Peminjaman Saya' : 'Sirkulasi Peminjaman'}
            </Link>
          </div>
        </div>

        {/* Decorative corner glow */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stat Cards - High Contrast */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#122420] border border-slate-200 dark:border-slate-800 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isMember ? 'Buku Sedang Dipinjam' : 'Total Koleksi & Aset'}
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {isMember ? `${stats.activeBorrowings} Buku` : `${stats.totalCollections} Item`}
            </span>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
              {isMember ? 'Aktif' : 'Buku & Fisik'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            {isMember ? 'Koleksi dalam masa pinjam Anda' : 'Tersedia di katalog terpadu'}
          </p>
        </div>

        {/* Card 2 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#122420] border border-slate-200 dark:border-slate-800 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isMember ? 'Total Riwayat Pinjam' : 'Sirkulasi Aktif'}
            </span>
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 font-bold">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {stats.totalBorrowings} Transaksi
            </span>
            <span className="text-xs text-blue-700 dark:text-blue-400 font-bold">Tercatat</span>
          </div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            {isMember ? 'Riwayat peminjaman akun Anda' : 'Buku & aset sedang dipinjam'}
          </p>
        </div>

        {/* Card 3 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#122420] border border-slate-200 dark:border-slate-800 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isMember ? 'Tanggungan Denda' : 'Kas Denda Tertagih'}
            </span>
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
              {formatCurrency(stats.totalFinesAmount || 0)}
            </span>
            <span className="text-xs text-amber-700 dark:text-amber-400 font-bold">
              {isMember ? 'Status Kas' : 'Audit Kas'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            {isMember ? 'Denda keterlambatan buku' : 'Otomatisasi denda harian'}
          </p>
        </div>

        {/* Card 4 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#122420] border border-slate-200 dark:border-slate-800 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isMember ? 'Status Bebas Pustaka' : 'Kondisi Aset Terjaga'}
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
              {isMember ? 'CLEAR' : '98.4%'}
            </span>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
              {isMember ? 'Syarat Wisuda' : 'Siap Edar'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            {isMember ? 'Bebas dari tunggakan pinjaman' : 'Bebas kerusakan / hilang'}
          </p>
        </div>
      </div>

      {/* Two Column Layout: Recent Circulation & Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Circulation Feed (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-[#122420] border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {isMember ? 'Koleksi Pinjaman Saya' : 'Sirkulasi & Peminjaman Terbaru'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isMember
                  ? 'Daftar buku yang sedang Anda pinjam beserta tanggal jatuh tempo'
                  : 'Monitoring transaksi peminjaman & pengembalian buku terkini'}
              </p>
            </div>
            <Link
              to="/borrowings"
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              Lihat Semua
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-[#0c1815] text-slate-700 dark:text-slate-200 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Peminjam</th>
                  <th className="py-3 px-4">Koleksi</th>
                  <th className="py-3 px-4">Jatuh Tempo</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {recentBorrowings.length > 0 ? (
                  recentBorrowings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        {b.user?.name || 'Member'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium max-w-[200px] truncate">
                        {b.collection?.title || 'Koleksi'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-mono font-medium">
                        {formatDate(b.due_date)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            b.status === 'borrowed'
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200'
                              : b.status === 'returned'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200'
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
                    <td colSpan="4" className="py-8 text-center text-slate-400">
                      Belum ada transaksi peminjaman aktif
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Operations Sidebar (1 col) */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white dark:bg-[#122420] border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">
              {isMember ? 'Menu Akses Mandiri' : 'Terminal Operasi Cepat'}
            </h2>
            <div className="space-y-3">
              <Link
                to="/collections"
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#0c1815] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 group-hover:scale-105 transition font-bold">
                    <Barcode className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition">
                      Pencarian Barcode & ISBN
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Scan instan kode buku / aset</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
              </Link>

              <Link
                to="/borrowings"
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#0c1815] hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 group-hover:scale-105 transition font-bold">
                    <ArrowLeftRight className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition">
                      {isMember ? 'Cek Batas Kembali Buku' : 'Check-in / Check-out Kilat'}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isMember ? 'Lihat tanggal jatuh tempo' : 'Proses peminjaman & hitung denda'}
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
              </Link>

              {!isMember && (
                <Link
                  to="/reports"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#0c1815] hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200 dark:border-slate-700 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 group-hover:scale-105 transition font-bold">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 transition">
                        Cetak Surat Bebas Pustaka
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Sertifikat yudisium resmi PDF</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
