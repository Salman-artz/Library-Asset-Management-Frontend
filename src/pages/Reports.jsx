import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../services/api'

export default function Reports() {
  const [tab, setTab] = useState('popular')
  const [popularCollections, setPopularCollections] = useState([])
  const [activeMembers, setActiveMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [exportData, setExportData] = useState(null)
  const [exportLoading, setExportLoading] = useState(false)

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
      setActiveMembers(res.data.data?.data || res.data.data || [])
    } catch (err) {
      toast.error('Gagal memuat member aktif')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    setExportLoading(true)
    try {
      const params = {}
      if (dateRange.start) params.start_date = dateRange.start
      if (dateRange.end) params.end_date = dateRange.end
      const res = await api.get('/reports/export', { params })
      const d = res.data.data || res.data
      setExportData(d.records || d)
      toast.success('Data berhasil dimuat')
    } catch (err) {
      toast.error('Gagal memuat data')
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
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'laporan-peminjaman.pdf')
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('PDF berhasil diunduh')
    } catch (err) {
      toast.error('Gagal unduh PDF')
    } finally {
      setExportLoading(false)
    }
  }

  useEffect(() => {
    if (tab === 'popular') fetchPopularCollections()
    if (tab === 'active') fetchActiveMembers()
  }, [tab])

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  }

  const tabs = [
    { id: 'popular', label: 'Koleksi Populer' },
    { id: 'active', label: 'Member Aktif' },
    { id: 'export', label: 'Export Data' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Laporan & Statistik</h1>
        <p className="text-sm text-gray-500 mt-1">Koleksi populer, member aktif, dan export data peminjaman</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
              tab === t.id
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Popular Collections */}
      {tab === 'popular' && (
        <>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {popularCollections.length === 0 ? (
                <div className="text-center py-12 text-gray-400">Belum ada data</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">#</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Koleksi</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Kode</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Total Dipinjam</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {popularCollections.map((col, idx) => (
                      <tr key={col.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-4 text-sm text-gray-500">{idx + 1}</td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{col.title}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{col.code}</td>
                        <td className="px-4 py-4 text-sm text-center font-semibold text-indigo-600">
                          {col.borrowings_count || 0}x
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}

      {/* Tab: Active Members */}
      {tab === 'active' && (
        <>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {activeMembers.length === 0 ? (
                <div className="text-center py-12 text-gray-400">Belum ada data</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">#</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Nama Member</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Total Peminjaman</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {activeMembers.map((member, idx) => (
                      <tr key={member.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-4 text-sm text-gray-500">{idx + 1}</td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{member.name}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{member.email}</td>
                        <td className="px-4 py-4 text-sm text-center font-semibold text-indigo-600">
                          {member.borrowings_count || 0}x
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}

      {/* Tab: Export */}
      {tab === 'export' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Export Laporan Peminjaman</h3>
          <div className="flex flex-col sm:flex-row gap-4 items-end mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <button
              onClick={handleExport}
              disabled={exportLoading}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition"
            >
              {exportLoading ? 'Loading...' : 'Tampilkan Data'}
            </button>
            <button
              onClick={handleExportPdf}
              disabled={exportLoading}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:bg-red-400 transition"
            >
              Unduh PDF
            </button>
          </div>

          {exportData && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Member</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Koleksi</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Tgl Pinjam</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Jatuh Tempo</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Tgl Kembali</th>
                    <th className="text-center px-3 py-2 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-right px-3 py-2 text-xs font-medium text-gray-500 uppercase">Denda</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(Array.isArray(exportData) ? exportData : []).map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-500">{idx + 1}</td>
                      <td className="px-3 py-2 font-medium">{item.member || item.member_name || item.user?.name || '-'}</td>
                      <td className="px-3 py-2">{item.collection || item.collection_title || item.collection?.title || '-'}</td>
                      <td className="px-3 py-2">{formatDate(item.borrowed_at)}</td>
                      <td className="px-3 py-2">{formatDate(item.due_date)}</td>
                      <td className="px-3 py-2">{formatDate(item.returned_at)}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.status === 'returned' ? 'bg-green-100 text-green-800' :
                          item.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right font-medium">
                        {item.fine_amount ? 'Rp ' + parseInt(item.fine_amount).toLocaleString('id-ID') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!exportData || exportData.length === 0) && (
                <p className="text-center py-8 text-gray-400">Tidak ada data untuk periode ini</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
