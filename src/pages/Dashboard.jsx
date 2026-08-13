import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { user, hasRole } = useAuth()

  const menuCards = [
    {
      title: 'Katalog Koleksi',
      description: 'Jelajahi koleksi perpustakaan, cari berdasarkan judul atau kategori',
      link: '/collections',
      icon: (
        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      bg: 'bg-white',
      show: true,
    },
    {
      title: 'Peminjaman Saya',
      description: 'Lihat riwayat peminjaman dan status pengembalian',
      link: '/borrowings',
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      bg: 'bg-white',
      show: !!user,
    },
    {
      title: 'Manajemen Kategori',
      description: 'Kelola kategori koleksi (Tambah, Edit, Hapus)',
      link: '/categories',
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      bg: 'bg-white',
      show: hasRole('admin', 'staff'),
    },
    {
      title: 'Denda',
      description: 'Cek riwayat denda keterlambatan dan pembayaran',
      link: '/fines',
      icon: (
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: 'bg-white',
      show: !!user,
    },
    {
      title: 'Laporan',
      description: 'Lihat statistik koleksi populer, member aktif, dan export data',
      link: '/reports',
      icon: (
        <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      bg: 'bg-white',
      show: hasRole('admin', 'staff'),
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Selamat datang, {user?.name || 'Pengunjung'}!
        </h1>
        <p className="text-gray-500 mt-1">
          {user ? (
            <>Anda login sebagai <span className="capitalize font-medium text-indigo-600">{user.role}</span></>
          ) : (
            'Silakan login untuk mengakses fitur peminjaman.'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuCards.filter(card => card.show).map((card, idx) => (
          <Link
            key={idx}
            to={card.link}
            className={`${card.bg} rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-indigo-300 transition-all group`}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 p-2 bg-gray-50 rounded-lg group-hover:bg-indigo-50 transition">
                {card.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{card.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {!user && (
        <div className="mt-8 p-6 bg-indigo-50 rounded-xl border border-indigo-200">
          <h3 className="font-semibold text-indigo-900">Fitur untuk Member</h3>
          <p className="text-sm text-indigo-700 mt-1">
            Setelah login, Anda dapat meminjam koleksi, melihat riwayat peminjaman, dan mengelola profil.
          </p>
          <Link
            to="/login"
            className="mt-3 inline-block px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
          >
            Login Sekarang
          </Link>
        </div>
      )}
    </div>
  )
}
