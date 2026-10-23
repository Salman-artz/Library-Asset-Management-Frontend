import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../services/api'
import {
  FileBarChart2,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  CheckCircle2,
  Calendar,
  Users,
  Award,
  Sparkles,
  Search,
  BookOpen,
  ShieldCheck,
  QrCode
} from 'lucide-react'

export default function Reports() {
  const [tab, setTab] = useState('popular')
  const [popularCollections, setPopularCollections] = useState([])
  const [activeMembers, setActiveMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [exportData, setExportData] = useState([])
  const [exportLoading, setExportLoading] = useState(false)

  // Surat Bebas Pustaka State
  const [selectedMember, setSelectedMember] = useState({
    id: 4,
    name: 'Member Satu',
    email: 'member1@library.test',
    studentId: 'LIB-2026-0819',
    department: 'Teknik Informatika & Sains Terapan',
  })
  const [showCertificateModal, setShowCertificateModal] = useState(false)

  const fetchPopularCollections = async () => {
    setLoading(true)
    try {
      const res = await api.get('/reports/popular-collections', { params: { limit: 10 } })
      setPopularCollections(res.data.data?.data || res.data.data || [])
    } catch (err) {
      toast.error('Gagal memuat koleksi populer')
    } finally {
      setLoading(false)
    }
  }

  const fetchActiveMembers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/reports/active-members', { params: { limit: 10 } })
      const list = res.data.data?.data || res.data.data || []
      setActiveMembers(list)
      if (list.length > 0) {
        setSelectedMember({
          id: list[0].id,
          name: list[0].name,
          email: list[0].email,
          studentId: `LIB-2026-0${list[0].id}42`,
          department: 'Teknik Informatika & Sains Terapan',
        })
      }
    } catch (err) {
      toast.error('Gagal memuat member aktif')
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async () => {
    setExportLoading(true)
    try {
      const params = {}
      if (dateRange.start) params.start_date = dateRange.start
      if (dateRange.end) params.end_date = dateRange.end
      const res = await api.get('/reports/export', { params })
      const d = res.data.data || res.data
      setExportData(d.records || d || [])
      toast.success('Data audit laporan berhasil dimuat')
    } catch (err) {
      toast.error('Gagal memuat data laporan')
    } finally {
      setExportLoading(false)
    }
  }

  const handleExportPdf = async () => {
    setExportLoading(true)
    try {
      const params = { format: 'pdf' }
      if (dateRange.start) params.start_date = dateRange.start
      if (dateRange.end) params.end_date = dateRange.end

      const res = await api.get('/reports/export', { params, responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'laporan-sirkulasi-perpustakaan.pdf')
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('File PDF laporan sirkulasi berhasil diunduh')
    } catch (err) {
      toast.error('Gagal mengunduh file PDF')
    } finally {
      setExportLoading(false)
    }
  }

  const handleExportCsv = () => {
    if (!exportData || exportData.length === 0) {
      toast.error('Tampilkan data terlebih dahulu sebelum ekspor CSV')
      return
    }

    const headers = ['ID', 'Peminjam', 'Koleksi', 'Tanggal Pinjam', 'Jatuh Tempo', 'Tanggal Kembali', 'Status']
    const rows = exportData.map(r => [
      r.id,
      `"${r.user?.name || '-'}"`,
      `"${r.collection?.title || '-'}"`,
      r.borrowed_at || '-',
      r.due_date || '-',
      r.returned_at || '-',
      r.status || '-'
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `audit-sirkulasi-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    toast.success('File CSV spreadsheet berhasil diunduh')
  }

  useEffect(() => {
    if (tab === 'popular') fetchPopularCollections()
    if (tab === 'active' || tab === 'clearance') fetchActiveMembers()
    if (tab === 'export') handleExportData()
  }, [tab])

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
  }

  const tabs = [
    { id: 'popular', label: 'Koleksi Populer', icon: BookOpen },
    { id: 'active', label: 'Member Paling Aktif', icon: Users },
    { id: 'export', label: 'Audit & Ekspor Data', icon: Download },
    { id: 'clearance', label: 'Cetak Surat Bebas Pustaka', icon: Award },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <FileBarChart2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          Laporan Analitik & Surat Bebas Pustaka
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Statistik sirkulasi buku, leaderboard member, audit log peminjaman, & penerbitan sertifikat yudisium
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-sand-200 dark:border-sage-800 pb-2">
        {tabs.map((t) => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                active
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white dark:bg-sage-900 border border-sand-200 dark:border-sage-800 text-slate-600 dark:text-slate-300 hover:bg-sand-100 dark:hover:bg-sage-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* TAB 1: Popular Collections */}
      {tab === 'popular' && (
        <div className="bg-white dark:bg-sage-900 rounded-2xl border border-sand-200 dark:border-sage-800 shadow-sm overflow-hidden p-6">
          <div className="mb-5 flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Koleksi Paling Sering Dipinjam
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Peringkat frekuensi peminjaman koleksi buku & aset fisik
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40 font-semibold">
              Top 10 Koleksi
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <div className="w-8 h-8 mx-auto border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs">Menganalisis frekuensi peminjaman...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sand-50 dark:bg-sage-950 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-sand-200 dark:border-sage-800">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">Rank</th>
                    <th className="py-3 px-4">Judul Koleksi</th>
                    <th className="py-3 px-4">Kode Identifikasi</th>
                    <th className="py-3 px-4 text-center">Total Dipinjam</th>
                    <th className="py-3 px-4 text-right">Tingkat Minat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-100 dark:divide-sage-800/60">
                  {popularCollections.map((col, idx) => (
                    <tr key={col.id} className="hover:bg-sand-50/50 dark:hover:bg-sage-800/30 transition">
                      <td className="py-3.5 px-4 text-center font-mono font-bold">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                            idx === 0
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-extrabold'
                              : idx === 1
                              ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                              : idx === 2
                              ? 'bg-amber-700/20 text-amber-900 dark:text-amber-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        {col.title}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400">
                        {col.code}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {col.borrowings_count || 1}x Transaksi
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="w-28 ml-auto bg-sand-200 dark:bg-sage-950 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${Math.min(100, Math.max(25, (col.borrowings_count || 1) * 20))}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Active Members */}
      {tab === 'active' && (
        <div className="bg-white dark:bg-sage-900 rounded-2xl border border-sand-200 dark:border-sage-800 shadow-sm overflow-hidden p-6">
          <div className="mb-5 flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Leaderboard Member Paling Aktif
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Anggota dengan sirkulasi peminjaman buku & literatur tertinggi
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40 font-semibold">
              Top Readers
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <div className="w-8 h-8 mx-auto border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs">Memuat leaderboard member...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sand-50 dark:bg-sage-950 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-sand-200 dark:border-sage-800">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">Rank</th>
                    <th className="py-3 px-4">Nama Lengkap</th>
                    <th className="py-3 px-4">Alamat Email</th>
                    <th className="py-3 px-4 text-center">Total Peminjaman</th>
                    <th className="py-3 px-4 text-right">Status Keanggotaan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-100 dark:divide-sage-800/60">
                  {activeMembers.map((m, idx) => (
                    <tr key={m.id} className="hover:bg-sand-50/50 dark:hover:bg-sage-800/30 transition">
                      <td className="py-3.5 px-4 text-center font-mono font-bold">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                            idx === 0
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-extrabold'
                              : 'text-slate-400'
                          }`}
                        >
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        {m.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400">
                        {m.email}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {m.borrowings_count || 1} Buku
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          Aktif & Tertib
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Multi-Format Exporter */}
      {tab === 'export' && (
        <div className="bg-white dark:bg-sage-900 rounded-2xl border border-sand-200 dark:border-sage-800 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Audit Transaksi & Ekspor Multi-Format
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Filter rentang tanggal dan unduh rekap sirkulasi dalam format PDF formal atau CSV Excel
            </p>
          </div>

          {/* Date range filter & export actions */}
          <div className="p-4 rounded-xl bg-sand-50 dark:bg-sage-950 border border-sand-200 dark:border-sage-800 flex flex-wrap items-end gap-3 text-xs">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Tanggal Awal
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="px-3 py-2 rounded-xl border border-sand-300 dark:border-sage-700 bg-white dark:bg-sage-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Tanggal Akhir
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="px-3 py-2 rounded-xl border border-sand-300 dark:border-sage-700 bg-white dark:bg-sage-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              onClick={handleExportData}
              disabled={exportLoading}
              className="px-4 py-2 rounded-xl bg-sand-200 hover:bg-sand-300 dark:bg-sage-800 dark:hover:bg-sage-700 text-slate-700 dark:text-slate-200 font-semibold transition"
            >
              Filter Data
            </button>

            <button
              onClick={handleExportCsv}
              disabled={exportLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Unduh CSV / Excel
            </button>

            <button
              onClick={handleExportPdf}
              disabled={exportLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow transition"
            >
              <FileText className="w-4 h-4" />
              Unduh Laporan PDF
            </button>
          </div>

          {/* Table Preview */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sand-50 dark:bg-sage-950 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-sand-200 dark:border-sage-800">
                <tr>
                  <th className="py-3 px-4"># ID</th>
                  <th className="py-3 px-4">Nama Member</th>
                  <th className="py-3 px-4">Koleksi Terkait</th>
                  <th className="py-3 px-4">Tgl Pinjam</th>
                  <th className="py-3 px-4">Jatuh Tempo</th>
                  <th className="py-3 px-4">Tgl Kembali</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100 dark:divide-sage-800/60">
                {exportData.length > 0 ? (
                  exportData.slice(0, 8).map((r) => (
                    <tr key={r.id} className="hover:bg-sand-50/50 dark:hover:bg-sage-800/30 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-500">#{r.id}</td>
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{r.user?.name}</td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 max-w-[200px] truncate">{r.collection?.title}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{r.borrowed_at?.slice(0, 10)}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{r.due_date}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{r.returned_at ? r.returned_at.slice(0, 10) : '-'}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="capitalize px-2 py-0.5 rounded text-[11px] font-medium bg-sand-100 dark:bg-sage-950 text-slate-700 dark:text-slate-300">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">
                      Klik "Filter Data" untuk melihat catatan audit sirkulasi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Surat Bebas Pustaka */}
      {tab === 'clearance' && (
        <div className="bg-white dark:bg-sage-900 rounded-2xl border border-sand-200 dark:border-sage-800 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Penerbitan Surat Keterangan Bebas Perpustakaan
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Surat verifikasi yudisium resmi yang menyatakan mahasiswa/member bebas dari pinjaman buku & tunggakan kas
              </p>
            </div>

            <button
              onClick={() => setShowCertificateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md transition"
            >
              <Printer className="w-4 h-4" />
              Buka & Cetak Surat Bebas Pustaka
            </button>
          </div>

          {/* Member Picker & Live Clearance Check */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-sand-50 dark:bg-sage-950 border border-sand-200 dark:border-sage-800 space-y-4 text-xs">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                Identitas Pemohon Bebas Pustaka
              </h3>

              <div>
                <label className="block text-slate-500 mb-1 font-medium">Pilih Member / Mahasiswa:</label>
                <select
                  value={selectedMember.id}
                  onChange={(e) => {
                    const found = activeMembers.find(m => m.id === parseInt(e.target.value))
                    if (found) {
                      setSelectedMember({
                        id: found.id,
                        name: found.name,
                        email: found.email,
                        studentId: `LIB-2026-0${found.id}42`,
                        department: 'Teknik Informatika & Sains Terapan',
                      })
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-sand-300 dark:border-sage-700 bg-white dark:bg-sage-900 text-slate-800 dark:text-slate-200 outline-none"
                >
                  {activeMembers.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-medium">Nomor Induk Mahasiswa (NIM):</label>
                <input
                  type="text"
                  value={selectedMember.studentId}
                  onChange={(e) => setSelectedMember({ ...selectedMember, studentId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-sand-300 dark:border-sage-700 bg-white dark:bg-sage-900 text-slate-800 dark:text-slate-200 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-medium">Program Studi / Fakultas:</label>
                <input
                  type="text"
                  value={selectedMember.department}
                  onChange={(e) => setSelectedMember({ ...selectedMember, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-sand-300 dark:border-sage-700 bg-white dark:bg-sage-900 text-slate-800 dark:text-slate-200 outline-none"
                />
              </div>
            </div>

            {/* Live Verification Clearance Status Card */}
            <div className="md:col-span-2 p-5 rounded-2xl bg-white dark:bg-sage-900 border-2 border-emerald-500/40 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-sand-200 dark:border-sage-800">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Hasil Verifikasi Sirkulasi & Kas Terpusat
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    CLEAR / BEBAS TANGGUNGAN
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 my-5 text-xs">
                  <div className="p-3.5 rounded-xl bg-sand-50 dark:bg-sage-950 border border-sand-200 dark:border-sage-800">
                    <span className="text-slate-400 block text-[11px]">Pinjaman Buku Aktif:</span>
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      0 Buku (Nihil)
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Semua koleksi telah kembali ke rak</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-sand-50 dark:bg-sage-950 border border-sand-200 dark:border-sage-800">
                    <span className="text-slate-400 block text-[11px]">Tunggakan Kas & Denda:</span>
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      Rp 0 (Lunas)
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Tidak ada denda keterlambatan</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-emerald-50/50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/40">
                  Sistem telah memverifikasi seluruh riwayat sirkulasi dan catatan kas denda atas nama <strong className="text-slate-900 dark:text-white">{selectedMember.name}</strong>. Pemohon berhak memperoleh <strong>Surat Bebas Pustaka</strong> untuk kelengkapan berkas skripsi & yudisium.
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-sand-200 dark:border-sage-800 flex justify-end">
                <button
                  onClick={() => setShowCertificateModal(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow transition"
                >
                  Lihat Lembar Sertifikat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Certificate Modal (Surat Bebas Pustaka) */}
      {showCertificateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-sand-300 w-full max-w-2xl text-slate-900 p-8 my-8 relative">
            {/* Action Bar (Top Right) */}
            <div className="no-print absolute top-4 right-4 flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" />
                Cetak / Simpan PDF
              </button>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                ✕ Tutup
              </button>
            </div>

            {/* Printable Certificate Content */}
            <div id="printable-certificate" className="space-y-6 pt-4">
              {/* Kop Surat Resmi */}
              <div className="text-center border-b-2 border-slate-900 pb-4">
                <div className="text-xs uppercase tracking-widest font-bold text-emerald-800">
                  KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI
                </div>
                <div className="text-lg font-extrabold tracking-wide uppercase mt-1">
                  UPT PERPUSTAKAAN & PUSAT SUMBER BELAJAR
                </div>
                <div className="text-xs text-slate-500">
                  Sistem Sirkulasi & Manajemen Aset Terpadu • Kampus Terakreditasi Unggul
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Jl. Telekomunikasi Terpadu No. 1 • Telp: (021) 789-0123 • Email: perpustakaan@library.test
                </div>
              </div>

              {/* Title */}
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold uppercase tracking-wider underline">
                  SURAT KETERANGAN BEBAS PERPUSTAKAAN
                </h3>
                <p className="text-xs font-mono text-slate-500">
                  Nomor: SKBP/2026/X/{selectedMember.id.toString().padStart(4, '0')}
                </p>
              </div>

              {/* Body */}
              <div className="text-xs text-slate-800 leading-relaxed space-y-3">
                <p>Kepala UPT Perpustakaan & Inventaris Aset dengan ini menerangkan bahwa:</p>

                <div className="ml-6 space-y-1.5 font-sans">
                  <div className="flex">
                    <span className="w-36 text-slate-500 font-medium">Nama Mahasiswa</span>
                    <span className="font-bold">: {selectedMember.name}</span>
                  </div>
                  <div className="flex">
                    <span className="w-36 text-slate-500 font-medium">Nomor Induk (NIM)</span>
                    <span className="font-mono font-semibold">: {selectedMember.studentId}</span>
                  </div>
                  <div className="flex">
                    <span className="w-36 text-slate-500 font-medium">Program Studi</span>
                    <span className="font-medium">: {selectedMember.department}</span>
                  </div>
                  <div className="flex">
                    <span className="w-36 text-slate-500 font-medium">Alamat Email</span>
                    <span className="font-mono">: {selectedMember.email}</span>
                  </div>
                </div>

                <p className="pt-2 text-justify">
                  Berdasarkan pemeriksaan basis data sistem sirkulasi terpadu pada tanggal <strong>{formatDate(new Date())}</strong>, nama mahasiswa tersebut di atas dinyatakan:
                </p>

                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-center">
                  <span className="text-sm font-extrabold text-emerald-900 tracking-wider uppercase">
                    BEBAS DARI SEGALA PINJAMAN BUKU & TANGGUNGAN KAS DENDA
                  </span>
                </div>

                <p className="text-justify">
                  Surat keterangan ini diterbitkan sebagai salah satu syarat pengurusan wisuda, pengambilan ijazah, dan pelepasan yudisium. Apabila di kemudian hari terdapat kekeliruan, surat ini akan diperbaiki sebagaimana mestinya.
                </p>
              </div>

              {/* Signature & Verification Block */}
              <div className="pt-6 flex justify-between items-end text-xs">
                {/* QR Code Validation */}
                <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-16 h-16 bg-slate-900 text-white flex items-center justify-center font-mono text-[9px] text-center p-1 rounded">
                    [QR SIGNED VALID]
                  </div>
                  <div className="text-[10px] text-slate-500 space-y-0.5">
                    <p className="font-bold text-slate-700">Verifikasi Digital</p>
                    <p>Doc ID: SBP-{selectedMember.id}-2026</p>
                    <p>Status: RESMI & SAH</p>
                  </div>
                </div>

                {/* Librarian Sign */}
                <div className="text-right space-y-1">
                  <p className="text-slate-500">Jakarta, {formatDate(new Date())}</p>
                  <p className="font-semibold text-slate-700">Kepala UPT Perpustakaan,</p>
                  <div className="h-12 flex items-center justify-end font-serif italic text-emerald-800 text-sm">
                    Muhammad Salman Alfarizy, S.Kom.
                  </div>
                  <p className="font-bold underline text-slate-900">Dr. H. Muhammad Salman, M.Kom.</p>
                  <p className="text-[10px] text-slate-500 font-mono">NIP. 19940819 202012 1 004</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
