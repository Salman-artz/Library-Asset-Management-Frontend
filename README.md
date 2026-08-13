# 📚 Library & Asset Management - Frontend

**Frontend** untuk sistem manajemen perpustakaan dan aset. Dibangun menggunakan **React + Vite + Tailwind CSS**.

## 🚀 Cara Install

```bash
# 1. Clone atau masuk ke folder project
cd library-aset-frontend

# 2. Install dependencies
npm install

# 3. Copy file environment
cp .env.example .env
# lalu sesuaikan VITE_API_BASE_URL dengan URL API backend Anda
```

## ⚙️ Environment Variable

| Variable | Default | Deskripsi |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost/library-aset-manajemen/public/api` | Base URL backend API |

Edit file `.env` di root project:
```env
VITE_API_BASE_URL=http://localhost/library-aset-manajemen/public/api
```

## 💻 Cara Menjalankan

### Development Mode
```bash
npm run dev
```
Aplikasi akan berjalan di `http://localhost:5173`

### Production Build
```bash
npm run build
npm run preview
```

## 📁 Struktur Folder

```
src/
├── components/        # Komponen reusable (Navbar, ProtectedRoute, dll)
├── context/           # React Context (AuthContext)
├── pages/             # Halaman-halaman aplikasi
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Collections.jsx
│   ├── Categories.jsx
│   ├── Borrowings.jsx
│   ├── Fines.jsx
│   └── Reports.jsx
├── services/          # Service layer (Axios instance)
├── App.jsx            # Routing utama
├── main.jsx           # Entry point
└── index.css          # Tailwind CSS imports
```

## 🔑 Akun Demo

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@library.test | password |
| **Staff** | staff1@library.test | password |
| **Member** | member1@library.test | password |

## 🛠️ Tech Stack

- **React 18** - UI Library
- **Vite 5** - Build Tool
- **Tailwind CSS 3** - Utility-first CSS
- **Axios** - HTTP Client
- **React Router DOM 6** - Routing
- **React Hot Toast** - Notifikasi
