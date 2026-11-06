# 🍽️ KantinQ — Sistem Pemesanan & Antrean Digital Kantin Kampus

[![Test Suite](https://img.shields.io/badge/tests-65%20passed-brightgreen.svg)](file:///d:/Kuliah/RPL/apps/web/src/test)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)
[![Security](https://img.shields.io/badge/DevSecOps-P8%20Hardened-orange.svg)](file:///d:/Kuliah/RPL/security_report.md)
[![License](https://img.shields.io/badge/License-Academic%20RPL-lightgrey.svg)](#)

> **KantinQ** adalah platform web modern berbasis QR Code yang mendigitalkan alur pemesanan makanan, antrean, dan manajemen stan kantin di lingkungan kampus. Dirancang untuk mengeliminasi antrean fisik berdesakan, meningkatkan transparansi waktu tunggu, dan mengamankan privasi data mahasiswa sesuai standar **DevSecOps (Assignment P8)**.

---

## 📑 Daftar Isi

1. [Panduan Fresh Clone & Deployment](#-fresh-clone--deployment)
2. [Tentang & Permasalahan Sistem](#-tentang--permasalahan-sistem)
3. [Arsitektur Monorepo & Struktur Direktori](#-arsitektur-monorepo--struktur-direktori)
4. [Implementasi Keamanan DevSecOps (Assignment P8)](#-implementasi-keamanan-devsecops-assignment-p8)
5. [Fitur Utama & Alur Kerja](#-fitur-utama--alur-kerja)
6. [Panduan Menjalankan Lingkungan Pengembangan (Local Dev)](#-panduan-menjalankan-lingkungan-pengembangan-local-dev)
7. [Pengujian & Verifikasi Kualitas (Quality Assurance)](#-pengujian--verifikasi-kualitas-quality-assurance)
8. [Informasi Kontributor & Mata Kuliah](#-informasi-kontributor--mata-kuliah)

---

## 🚀 FRESH CLONE & DEPLOYMENT

Untuk melakukan instalasi dari awal pada mesin atau server baru (*fresh machine / fresh clone*), ikuti urutan perintah standar berikut secara presisi:

### 1. Kloning Repositori
```bash
git clone https://github.com/Cornelius-prog/KantinQ.git
cd KantinQ
```

### 2. Instalasi Seluruh Dependensi Monorepo
Gunakan `npm ci` (jika menggunakan lockfile pada CI/CD) atau `npm install` pada *root workspace*:
```bash
npm ci
# atau:
npm install
```
*Perintah ini akan secara otomatis menginstal dependensi untuk seluruh workspaces: `packages/shared`, `apps/api`, dan `apps/web`.*

### 3. Build Seluruh Aplikasi (Compile & Bundle)
Jalankan proses kompilasi TypeScript dan pembuatan artefak produksi Vite:
```bash
# Build seluruh workspace (shared, api, web)
npm run build

# Atau build web application saja:
npm run build:web
```
*Output build web akan tersedia di `apps/web/dist/` dengan status bebas error TypeScript/Vite.*

### 4. Menjalankan Mode Pratinjau Produksi (Preview)
Uji artefak build produksi web secara lokal:
```bash
npm run preview
```
*Aplikasi web produksi akan berjalan di `http://localhost:4173` (atau port yang ditentukan Vite preview).*

### 5. Menjalankan Seluruh Automated Test Suite
Pastikan seluruh 65 unit & security tests berjalan 100% lulus:
```bash
npm test
```
*Menjalankan Vitest runner pada workspace web. Seluruh 65 tests wajib berstatus `passed`.*

---

## 💡 Tentang & Permasalahan Sistem

Pada jam istirahat perkuliahan, lonjakan pesanan seringkali menimbulkan:
1. **Antrean Fisik Padat:** Mahasiswa berdiri lama menunggu pesanan dicatat secara verbal.
2. **Human Error Pemesanan:** Pesanan tertukar atau salah catat saat kondisi stan ramai.
3. **Ketiadaan Visibilitas:** Mahasiswa tidak mengetahui estimasi antrean sebelum memesan.

### Solusi KantinQ:
- **Scan QR Code:** Mahasiswa membuka menu digital stan tertentu langsung dari smartphone.
- **Digital Cart & Checkout:** Memilih menu, menentukan kuantitas, dan memasukkan nama/identitas pemesan.
- **Automated Queue Number:** Sistem menerbitkan nomor antrean instan (contoh: `A-001`, `B-004`).
- **Real-Time Queue Indicator:** Status kepadatan antrean otomatis (**Sepi** 🟢, **Sedang** 🟡, **Ramai** 🔴).
- **Merchant Dashboard:** Penjual memproses pesanan bertahap: `WAITING` $\rightarrow$ `PROCESSING` $\rightarrow$ `READY` $\rightarrow$ `COMPLETED`.

---

## 🏗️ Arsitektur Monorepo & Struktur Direktori

KantinQ dibangun menggunakan arsitektur monorepo modular TypeScript berbasis **npm workspaces**:

```text
KantinQ/
├── apps/
│   ├── web/                          # Frontend React 18 SPA (Vite + Tailwind CSS)
│   │   ├── index.html                # Entry HTML dengan CSP Header Meta Tag
│   │   ├── src/
│   │   │   ├── components/           # UI Components (Badge, MenuList, Navbar, ErrorBoundary)
│   │   │   ├── hooks/                # Custom React Hooks (useCart, useLocalStorage, useOrderHistory)
│   │   │   ├── pages/                # Halaman Aplikasi (Ordering, Confirmation, Queue, Dashboard)
│   │   │   ├── services/             # HTTP Client (ApiClient)
│   │   │   ├── utils/                # Utility (logger.ts, validation.ts)
│   │   │   ├── test/                 # Vitest Suite (65 tests)
│   │   │   ├── App.tsx               # Root Component KantinQ
│   │   │   └── main.tsx              # React Entry Point (Wrapped with ErrorBoundary)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   │
│   └── api/                          # Backend Express REST API
│       ├── src/
│       │   ├── controllers/          # Request handlers
│       │   ├── services/             # Business logic & queue management
│       │   ├── routes/               # Express endpoints
│       │   └── server.ts             # Server entry point
│       ├── prisma/                   # ORM Schema & Database Seed
│       └── package.json
│
├── packages/
│   └── shared/                       # Shared Types, DTOs, Enums, & Models
│       ├── src/
│       │   ├── enums/                # OrderStatus, QueueCondition
│       │   ├── models/               # Canteen, MenuItem, Order, OrderItem
│       │   └── dto/                  # OrderResponse, QueueResponse, DashboardResponse
│       └── package.json
│
├── docker-compose.yml                # MySQL 8.0 Container Definition
├── security_report.md                # Formal Security Audit Report (Assignment P8)
├── package.json                      # Monorepo Root Script Configuration
└── README.md                         # Main Portal Documentation
```

---

## 🛡️ Implementasi Keamanan DevSecOps (Assignment P8)

Sebagai bagian dari pemenuhan **Tugas P8 DevSecOps**, KantinQ mengintegrasikan pengamanan berlapis pada sisi client dan data flow:

### 1. Secure Logger Utility & PII Masking ([`logger.ts`](file:///d:/Kuliah/RPL/apps/web/src/utils/logger.ts))
Menggantikan pemanggilan `console.*` mentah dengan *wrapper* yang secara otomatis menyamarkan data sensitif mahasiswa sebelum dikirim ke *developer console*:
- Pola Nama & NIM Mahasiswa: `"Budi Santoso (NIM 21012345)"` $\rightarrow$ `"Budi S*** (NIM 210***)"`.
- Pola NIM Mandiri: `"NIM 21012345"` $\rightarrow$ `"NIM 210***"`.
- Kredensial Sensitif: Field seperti `password`, `token`, `secret`, `authorization` otomatis disensor menjadi `[REDACTED]`.

### 2. Global React Error Boundary ([`ErrorBoundary.tsx`](file:///d:/Kuliah/RPL/apps/web/src/components/ErrorBoundary.tsx))
- Mengintersepsi error *unhandled rendering crash* secara global di level root (`<App />`).
- **Mencegah Information Disclosure:** Menghilangkan *raw stack trace* dan detail jalur kode internal dari tampilan pengguna.
- Menampilkan pesan berbahasa Indonesia yang bersahabat (*user-friendly*) dilengkapi tombol **Muat Ulang** dan **Beranda**.
- Meneruskan error ke `logger.error` dalam format data yang telah disanitasi.

### 3. Content Security Policy (CSP Meta Tag)
Dikonfigurasikan pada `index.html` untuk memitigasi serangan **Cross-Site Scripting (XSS)** dan injeksi skrip eksternal:
```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' http: https: ws: wss:; object-src 'none'; base-uri 'self';"
/>
```

---

## 📱 Fitur Utama & Alur Kerja

| Fitur | Deskripsi | Hak Akses |
|---|---|---|
| **Pemesanan QR** | Membuka menu kantin berdasarkan URL parameter stan (`?canteenId=1`). | Mahasiswa |
| **Pencarian & Filter** | Pencarian instan dan filter kategori: *Semua*, *Makanan*, *Minuman*, *Tersedia*. | Mahasiswa |
| **Keranjang Belanja** | Tambah/kurang item, validasi batas stok, dan kalkulasi subtotal instan. | Mahasiswa |
| **Pelacakan Antrean** | Polling status pesanan berkala (`WAITING` $\rightarrow$ `READY` $\rightarrow$ `COMPLETED`). | Mahasiswa |
| **Riwayat Pesanan** | Riwayat transaksi lokal (*localStorage*) dengan opsi hapus riwayat. | Mahasiswa |
| **Seller Dashboard** | Antrean aktif, kontrol status pesanan dengan tombol aksi bertahap. | Penjual |
| **Manajemen Menu** | Tambah menu, ubah harga, toggle stok ketersediaan, dan hapus menu. | Penjual |
| **Monitor Antrean** | Visualisasi nomor antrean yang sedang disiapkan dan dipanggil. | Publik / Layar TV |

---

## 💻 Panduan Menjalankan Lingkungan Pengembangan (Local Dev)

Jika ingin menjalankan seluruh ekosistem (Frontend, Backend, dan Database):

### 1. Konfigurasi Environment Variables
Salin contoh file `.env`:
```bash
cp .env.example .env
cp .env.example apps/api/.env
```
Default konfigurasi:
```env
PORT=3001
DATABASE_URL="mysql://root:root@localhost:3306/kantinq"
VITE_API_URL="http://localhost:3001"
WEB_URL="http://localhost:5173"
```

### 2. Nyalakan Database MySQL (Docker Compose)
```bash
docker compose up -d
```

### 3. Migrasi & Seed Database
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 4. Jalankan Aplikasi
Jalankan Frontend dan Backend secara bersamaan dengan satu perintah:
```bash
npm run dev
```
- **Web Client:** `http://localhost:5173`
- **Backend API:** `http://localhost:3001` (Health check: `http://localhost:3001/api/health`)

> **Offline Demo Mode:** Jika MySQL/Docker tidak aktif, frontend KantinQ memiliki mekanisme otomatis beralih ke *mock data* terpadu sehingga seluruh antarmuka tetap dapat diuji secara lancar.

---

## 🧪 Pengujian & Verifikasi Kualitas (Quality Assurance)

KantinQ menerapkan automated testing ketat menggunakan **Vitest** dan **React Testing Library**:

```bash
# Menjalankan seluruh unit & integration test
npm test

# Menjalankan test dalam mode watch
npm run test:watch --workspace=apps/web
```

### Cakupan Pengujian (65 Passing Tests):
- **`logger.test.ts` (16 tests):** Validasi penyensoran string PII, Nama + NIM, standalone NIM, masking objek, array bersarang, error message, dan fungsi wrapper console (`info`, `warn`, `error`, `debug`).
- **`errorBoundary.test.tsx` (3 tests):** Validasi intersepsi error render komponen, penyembunyian stack trace, sanitasi error logging, dan tombol recovery.
- **`validation.test.ts` (17 tests):** Validasi nama pemesan, kuantitas keranjang, ketersediaan stok, harga menu, dan formatter mata uang Rupiah.
- **`components.test.tsx` (10 tests):** Pengujian unit komponen badge status, indikator antrean, dan interaksi pemilihan menu.
- **`useCart.test.ts` (8 tests):** Validasi manipulasi keranjang, penambahan kuantitas, kalkulasi total harga, dan pembersihan keranjang.
- **`api.test.ts` (6 tests):** Validasi client API interface ke backend endpoints.
- **`useOrderHistory.test.ts` (5 tests):** Pengujian persistensi riwayat pesanan ke storage.

---

## 👥 Informasi Kontributor & Mata Kuliah

Proyek ini dikembangkan dan diselesaikan untuk memenuhi tugas mata kuliah **Rekayasa Perangkat Lunak (RPL)**:
- **Institusi:** Program Studi Teknik Informatika / Ilmu Komputer
- **Topik P8:** Security Hardening, DevSecOps Implementation, Error Boundary & Masked Logging
- **Pengembang:** Davin Cornelius

---
*KantinQ — Pesan Cerdas, Tanpa Cemas, Bebas Antrean.*
