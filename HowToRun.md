# 📖 Panduan Menjalankan KantinQ (HowToRun.md)

**KantinQ** adalah aplikasi web pemesanan dan antrean digital kantin kampus berbasis QR Code yang dibangun menggunakan arsitektur Monorepo TypeScript.

---

## 📋 1. Prasyarat Sistem (Prerequisites)

Sebelum menjalankan aplikasi, pastikan perangkat Anda telah terpasang:
* **Node.js**: Versi `>= 18.0.0` (Direkomendasikan Node.js 20 LTS atau 24 LTS)
* **npm**: Versi `>= 9.0.0` (Bawaan Node.js)
* **Git**: Untuk cloning repository
* **Docker & Docker Desktop**: *(Opsional)* Jika ingin menjalankan database MySQL lokal via Docker Compose

---

## 🏗️ 2. Struktur Monorepo Proyek

Proyek ini menggunakan **npm workspaces** dengan struktur sebagai berikut:

```text
kantinq/
├── apps/
│   ├── web/            # Frontend (React 18 + TypeScript + Vite + Tailwind CSS + Vitest)
│   └── api/            # Backend (Node.js + Express + TypeScript + Prisma ORM)
├── packages/
│   └── shared/         # Shared library (Model, DTO, Enums, Type definitions)
├── docker-compose.yml  # Docker container untuk database MySQL
├── package.json        # Root scripts dan workspaces config
└── HowToRun.md         # Dokumen petunjuk instalasi dan pengoperasian
```

---

## 🚀 3. Langkah Instalasi (Step-by-Step Setup)

### Langkah 1: Clone Repository & Masuk ke Folder Proyek
Buka terminal dan jalankan:
```bash
git clone <URL_REPOSITORY_ANDA>
cd RPL
```

### Langkah 2: Install Dependensi
Jalankan perintah ini di root folder untuk menginstal dependensi seluruh workspace (`packages/shared`, `apps/api`, dan `apps/web`):
```bash
npm install
```

### Langkah 3: Konfigurasi Environment Variable
Salin file `.env.example` menjadi `.env` di root project dan di folder `apps/api/`:

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
Copy-Item .env.example apps/api/.env
```

**Linux / macOS / Git Bash:**
```bash
cp .env.example .env
cp .env.example apps/api/.env
```

Konfigurasi standar dalam `.env`:
```env
PORT=3001
DATABASE_URL="mysql://root:root@localhost:3306/kantinq"
VITE_API_URL="http://localhost:3001"
WEB_URL="http://localhost:5173"
```

---

## 🗄️ 4. Menjalankan Database MySQL & Seeding (Opsional / Mode MySQL)

> **Catatan Demo Offline:**  
> KantinQ dilengkapi mekanisme **Smart Fallback State** di `localStorage`. Jika Anda tidak menyalakan Docker/MySQL, frontend web tetap 100% berfungsi normal untuk demonstrasi pemesanan, antrean, dan dashboard!

Jika ingin menjalankan MySQL menggunakan Docker:
1. Pastikan aplikasi **Docker Desktop** sudah berjalan.
2. Jalankan container MySQL di background:
   ```bash
   docker compose up -d
   ```
3. Sinkronisasikan skema Prisma ke database:
   ```bash
   npm run db:generate
   npm run db:push
   ```
4. Masukkan data awal (Seed Canteen, Menu & Antrean Awal):
   ```bash
   npm run db:seed
   ```

---

## 💻 5. Menjalankan Aplikasi

### Opsi A: Jalankan Frontend & Backend Sekaligus (Rekomendasi)
Cukup jalankan satu perintah dari root project:
```bash
npm run dev
```
* **Frontend Web**: [http://localhost:5173](http://localhost:5173)
* **Backend REST API**: [http://localhost:3001](http://localhost:3001) (Health check: [http://localhost:3001/api/health](http://localhost:3001/api/health))

---

### Opsi B: Jalankan Masing-Masing di Terminal Terpisah

* **Terminal 1 (Frontend Web Saja):**
  ```bash
  npm run dev:web
  ```
  Akses di browser: `http://localhost:5173`

* **Terminal 2 (Backend API Saja):**
  ```bash
  npm run dev:api
  ```
  Akses di browser: `http://localhost:3001`

---

## 🧪 6. Menjalankan Pengujian (Automated Unit Testing)

KantinQ memiliki test suite unit testing otomatis menggunakan **Vitest** dan **React Testing Library** yang menguji validasi, logic keranjang, komponen UI, persistence hook, dan alur API:

```bash
# Menjalankan seluruh pengujian unit test (Single-run regression suite)
npm test

# Atau jalankan workspace web secara spesifik
npm run test:web

# Menjalankan pengujian dalam mode interaktif (Watch mode)
npm run test:watch --workspace=apps/web
```

Hasil pengujian yang diharapkan:
```text
✓ src/test/validation.test.ts (17 tests)
✓ src/test/useCart.test.ts (8 tests)
✓ src/test/components.test.tsx (10 tests)
✓ src/test/api.test.ts (6 tests)
✓ src/test/useOrderHistory.test.ts (5 tests)

Test Files  5 passed (5)
     Tests  46 passed (46)
```

---

## 📦 7. Build untuk Produksi (Production Build)

Untuk memvalidasi bundle produksi:
```bash
# Build paket shared, backend, dan frontend
npm run build

# Atau build frontend web saja
npm run build:web
```

Untuk melihat pratinjau hasil build produksi web:
```bash
npm run preview --workspace=apps/web
```

---

## 🛠️ 8. Panduan Fitur & Navigasi Halaman

Setelah membuka `http://localhost:5173`, navigasikan melalui tab pada Navbar:
1. **Pesan Menu (`tab=order`)**:
   * Browse makanan & minuman.
   * Filter kategori: *Semua*, *Makanan*, *Minuman*, *Tersedia*.
   * Tambah menu ke keranjang, atur porsi dengan tombol `+` dan `-`.
   * Masukkan nama pemesan dan klik **Buat Pesanan**.
   * Halaman akan otomatis beralih ke tiket antrean digital dengan nomor antrean Anda.
2. **Pesanan Saya (`tab=myorders`)**:
   * Menampilkan daftar pesanan yang pernah dibuat pada browser ini.
   * Klik tombol **Segarkan Status** untuk memperbarui status pesanan terbaru.
   * Klik pada kartu pesanan untuk membuka kembali tiket antrean.
3. **Pantau Antrean (`tab=queue`)**:
   * Papan antrean 3 kolom: *Menunggu*, *Sedang Diproses*, dan *Siap Diambil*.
   * Indikator kondisi antrean stan: *Sepi* (0–5), *Sedang* (6–15), *Ramai* (>15).
4. **Dashboard Penjual (`tab=dashboard`)**:
   * Menampilkan kartu metrik pesanan dan omset hari ini.
   * Penjual dapat mengklik tombol aksi untuk memajukan status pesanan: `WAITING` &rarr; `PROCESSING` &rarr; `READY` &rarr; `COMPLETED`.
5. **Kelola Menu (`tab=menu`)**:
   * Tambah menu baru, ubah harga/deskripsi, dan ubah status stok (Tersedia / Habis).
6. **QR Kantin (`tab=canteen`)**:
   * Menampilkan QR Code resmi stan kantin untuk dipindai oleh mahasiswa.

---

## ❓ 9. Solusi Masalah Umum (Troubleshooting)

| Kendala | Penyebab Umum | Solusi |
|---|---|---|
| Port `5173` atau `3001` sudah terpakai | Ada proses node lain yang masih berjalan | Hentikan proses yang berjalan atau ubah port pada `.env` dan `apps/web/vite.config.ts`. |
| Docker MySQL tidak bisa connect | Docker Desktop belum dibuka | Buka Docker Desktop dan jalankan `docker compose up -d`. Anda juga bisa langsung menggunakan mode offline demo tanpa database MySQL. |
| Perubahan antrean tidak muncul | Browser meng-cache state lama | Klik tombol **Segarkan** pada halaman atau hapus cache `localStorage` di Developer Tools browser (`F12` > Application > Local Storage). |
