# PUSTAKA SENTRAL — Sistem Informasi Perpustakaan & Sirkulasi Koleksi (Frontend)

Modern, responsive web frontend untuk sistem informasi sirkulasi perpustakaan institusional terpadu. Dibangun dengan palet warna **Forest Pine & Mint** (`#122D27`), tata letak **Responsive Fluid Full-Width**, **Fixed Non-Scroll Sidebar Layout**, navigasi **Collapsible Sidebar**, dukungan **Dark Mode**, pemindaian **Barcode/ISBN**, **Chart Analitik Sirkulasi Buku Terpopuler**, sirkulasi **Fast Check-in/Check-out** dengan kalkulator denda otomatis presisi, serta penerbitan **Surat Keterangan Bebas Perpustakaan** resmi.

---

## 📸 Antarmuka Sistem & Portfolio Showcase

<p align="center">
  <img src="public/screenshots/26_dashboard_clean_no_capsules.png" alt="Pustaka Sentral Dashboard Clean & Chart" width="95%" />
  <br/>
  <em>Dashboard Pustaka Sentral — Tampilan Bersih Bebas Capsule AI-Slop, Tata Letak Full-Width Responsif, Sidebar Fixed Viewport, dan Chart Analitik Koleksi Terpopuler</em>
</p>

<details open>
<summary><strong>Lihat Dokumentasi Fitur Utama ▾</strong></summary>

| Fitur / Modul | Preview Antarmuka |
|---|---|
| **Chart Statistik Buku Terpopuler**<br/>Grafik batang analitik persentase frekuensi peminjaman koleksi buku paling diminati secara real-time. | <img src="public/screenshots/23_pustaka_sentral_dashboard_chart.png" alt="Chart Analitik Buku" width="460" /> |
| **Login Bersih & Otentik**<br/>Formulir autentikasi profesional tanpa elemen demo dummy, terstandardisasi siap produksi. | <img src="public/screenshots/22_pustaka_sentral_login_clean.png" alt="Login Bersih" width="460" /> |
| **Katalog & Filter Barcode ISBN**<br/>Pencarian instan kode ISBN/barcode, filter kategori literatur, dan indikator meter stok fisik. | <img src="public/screenshots/04_collections_catalog.png" alt="Katalog Koleksi" width="460" /> |
| **Sirkulasi & Fast Check-out**<br/>Peminjaman kilat terintegrasi dengan opsi durasi adaptif peminjam (7/14/30 hari). | <img src="public/screenshots/08_fast_checkout_modal.png" alt="Fast Checkout" width="460" /> |
| **1-Click Return & Kalkulator Denda**<br/>Perhitungan otomatis keterlambatan harian (Rp 3.000/hari) saat barang dikembalikan di meja sirkulasi. | <img src="public/screenshots/09_return_fine_calculator_modal.png" alt="Fine Calculator" width="460" /> |
| **Format Sertifikat Bebas Pustaka Cetak**<br/>Layout kop surat resmi dengan validasi digital QR code & tanda tangan digital pustakawan untuk syarat yudisium. | <img src="public/screenshots/12_surat_bebas_pustaka_official.png" alt="Surat Bebas Pustaka" width="460" /> |
| **Manajemen Kas & Denda Keterlambatan**<br/>Monitoring kas masuk, audit denda per member, dan verifikasi status lunas. | <img src="public/screenshots/13_fines_kas_management.png" alt="Kas Denda" width="460" /> |

</details>

---

## 🏛️ Clean Architecture & Pemisahan Lapisan (Frontend)

Frontend menerapkan prinsip **Clean Architecture & Separation of Concerns** untuk memisahkan UI presentation dari data fetching, komunikasi HTTP, dan state management:

```
┌────────────────────────────────────────────────────────┐
│  Presentation Layer (UI Views & Layouts)               │
│  Pages, Modals, Shared Layout, Badges                  │
│  (src/pages, src/components)                           │
└───────────────────────────┬────────────────────────────┘
                            │ (Calls Hooks & Services)
                            ▼
┌────────────────────────────────────────────────────────┐
│  Application & Context Layer (State Management)        │
│  AuthContext, ThemeContext, Route Guards               │
│  (src/context, src/components/ProtectedRoute)          │
└───────────────────────────┬────────────────────────────┘
                            │ (Calls Domain Services)
                            ▼
┌────────────────────────────────────────────────────────┐
│  Domain Service Layer (Modular Domain API Clients)     │
│  authService, collectionService, borrowingService,     │
│  fineService, categoryService, reportService           │
│  (src/services/*.service.js, src/services/index.js)    │
└───────────────────────────┬────────────────────────────┘
                            │ (Uses Axios Client)
                            ▼
┌────────────────────────────────────────────────────────┐
│  Infrastructure Layer (Network & Storage Client)       │
│  Axios Instance, Bearer Token Interceptor, LocalStorage│
│  (src/services/api.js)                                 │
└────────────────────────────────────────────────────────┘
```

### Struktur Direktori Frontend:
- **`src/pages/`**: Komponen halaman utama (`Dashboard`, `Collections`, `Borrowings`, `Fines`, `Reports`, `Categories`, `Login`, `Profile`). Setiap halaman hanya fokus pada penyajian UI dan berinteraksi secara murni melalui domain service.
- **`src/components/`**: Komponen UI reusable (`SidebarLayout`, `ProtectedRoute`).
- **`src/context/`**: State context global (`AuthContext`, `ThemeContext`).
- **`src/services/`**: Modul domain service terisolasi (`auth.service.js`, `collection.service.js`, `borrowing.service.js`, `fine.service.js`, `category.service.js`, `report.service.js`) dengan barrel export di `index.js`.
- **`src/assets/`**: Asset biner resmi (logo, ikon, favicon) yang dibundel langsung via Vite ES module.

---

1. **Branding Pustaka Sentral**: Identitas sistem perpustakaan modern yang otentik, elegan, dan profesional.
2. **Fixed Sidebar Layout**: Sidebar navigasi terkunci penuh pada 100% viewport (`h-screen overflow-hidden`) tanpa perlu scroll ganda. Profil pengguna, Dark Mode switcher, dan tombol Logout selalu terlihat dan dapat diakses instan.
3. **Desain Bersih & Elegan (Anti AI-Slop)**: Menghilangkan pill/capsule status dekoratif dan tombol demo dummy, digantikan oleh badge terstruktur (`rounded-md`) yang bersih dan berstandar enterprise.
4. **Chart Analitik Sirkulasi Buku**: Visualisasi batang horizontal interaktif yang memeringkatkan buku paling sering dipinjam lengkap dengan badge ranking (`#1`, `#2`, `#3`), kategori literatur, ISBN, frekuensi transaksi, dan persentase pangsa pasar peminjaman.
5. **Responsive Fluid Full-Width Layout**: Tata letak fleksibel (`w-full`) yang beradaptasi sempurna dengan seluruh ukuran layar monitor (laptop, ultrawide, maupun desktop).
6. **Multi-Role Responsiveness**: Antarmuka adaptif dengan hak akses berjenjang untuk **Administrator**, **Staff Sirkulasi**, dan **Member Pembaca**.

---

## 🛠️ Tech Stack

| Komponen | Spesifikasi |
|---|---|
| **Framework** | React 18.3 |
| **Build Tool** | Vite 5.4 |
| **Styling** | Tailwind CSS 3.4 (Custom Theme & Dark Mode) |
| **Icons** | Lucide React |
| **Routing** | React Router DOM 6.26 |
| **HTTP Client** | Axios 1.7 |
| **Testing & E2E** | Playwright MCP |
| **Notifications** | React Hot Toast |

---

## 🚀 Menjalankan Project

```bash
# 1. Install dependencies
npm install

# 2. Jalankan dev server
npm run dev

# 3. Build untuk produksi
npm run build
```

---

## 🔗 Repository Terkait

- **Backend REST API (Laravel 13)**: [Salman-artz/library-asset-management-api](https://github.com/Salman-artz/library-asset-management-api)
- **Frontend Web (React & Vite)**: [Salman-artz/Library-Asset-Management-Frontend](https://github.com/Salman-artz/Library-Asset-Management-Frontend)
