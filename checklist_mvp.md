# 📋 Matriks Checklist Fitur MVP KantinQ (P7 Final Release)

Dokumen ini memetakan seluruh fitur inti **Minimum Viable Product (MVP) KantinQ** berdasarkan spesifikasi tugas besar Rekayasa Perangkat Lunak (RPL), mencakup deskripsi fitur, user story, status implementasi, dan status pengujian unit test.

---

## 📊 Matriks Fitur MVP

| No | Feature Name | Description | User Story | Status | Unit Test Status |
|:--:|---|---|---|:---:|:---:|
| 1 | **Digital Menu Listing** | Menampilkan daftar makanan & minuman kantin lengkap dengan foto/ikon, harga format Rupiah, deskripsi, dan badge ketersediaan (*Tersedia* / *Habis*). | *Sebagai mahasiswa, saya ingin melihat menu kantin secara digital agar saya dapat mengetahui menu dan harga sebelum memesan.* | **COMPLETED** | **PASSED** (`components.test.tsx`, `api.test.ts`) |
| 2 | **Menu Search & Keyword Filter** | Pencarian teks interaktif berdasarkan nama makanan atau deskripsi dengan penanganan pencarian kosong & tombol reset filter. | *Sebagai mahasiswa, saya ingin mencari makanan favorit melalui kata kunci agar waktu pemilihan menu lebih cepat.* | **COMPLETED** | **PASSED** (`components.test.tsx`) |
| 3 | **Quick Category Filtering** | Filter cepat kategori menu (*Semua*, *Makanan*, *Minuman*, *Tersedia*) dengan indikator jumlah item real-time pada setiap pill kategori. | *Sebagai mahasiswa, saya ingin memfilter menu berdasarkan makanan atau minuman saja agar browsing menu lebih terarah.* | **COMPLETED** | **PASSED** (`components.test.tsx`, `validation.test.ts`) |
| 4 | **Interactive Shopping Cart** | Keranjang belanja sisi klien untuk menambah menu, memodifikasi kuantitas porsi (`+` dan `-`), menghapus item, dan menghitung subtotal serta total pembayaran otomatis. | *Sebagai mahasiswa, saya ingin mengatur kuantitas makanan di keranjang belanja agar pesanan saya sesuai dengan porsi yang diinginkan.* | **COMPLETED** | **PASSED** (`useCart.test.ts`) |
| 5 | **Form Validation & Input Guarding** | Validasi nama pemesan (2–50 karakter, wajib mengandung huruf), validasi keranjang tidak boleh kosong, dan proteksi dari pemesanan menu yang stoknya habis. | *Sebagai sistem kasir, saya ingin memvalidasi nama pelanggan dan ketersediaan stok agar pesanan yang dibuat valid dan dapat diproses dapur.* | **COMPLETED** | **PASSED** (`validation.test.ts`) |
| 6 | **Automated Queue Number Generation** | Pembuatan pesanan ke API/Mock Persistence dan penerbitan nomor antrean digital otomatis berurutan (contoh: `A-001`, `A-002`, dst.) dengan status awal `WAITING`. | *Sebagai mahasiswa, saya ingin menerima nomor antrean digital langsung setelah memesan agar saya mengetahui nomor panggilan pesanan saya.* | **COMPLETED** | **PASSED** (`api.test.ts`) |
| 7 | **Order Confirmation & Progress Tracking** | Tiket pesanan digital berisi nomor antrean jumbo, rincian pesanan, progress tracker status 4-tahap, notifikasi saat status `READY`, dan instruksi bayar di kasir. | *Sebagai mahasiswa, saya ingin memantau status pembuatan pesanan saya dari layar smartphone tanpa harus berdiri di depan etalase.* | **COMPLETED** | **PASSED** (`api.test.ts`, `components.test.tsx`) |
| 8 | **Auto-Polling Status Synchronization** | Pembaruan status pesanan otomatis secara berkala (setiap 4 detik) pada halaman konfirmasi tiket sehingga perubahan status dari penjual langsung tampil tanpa reload manual. | *Sebagai mahasiswa, saya ingin status pesanan saya ter-update otomatis ketika penjual selesai memasak agar saya segera mengambil makanan.* | **COMPLETED** | **PASSED** (`api.test.ts`, `components.test.tsx`) |
| 9 | **Customer Order History ("Pesanan Saya")** | Penyimpanan riwayat pesanan di perangkat mahasiswa (`localStorage`) yang memungkinkan melihat kembali tiket lama, menyinkronkan status terkini, dan menghapus riwayat. | *Sebagai mahasiswa, saya ingin melihat daftar pesanan yang pernah saya buat di perangkat ini agar saya dapat mengakses kembali tiket antrean saya.* | **COMPLETED** | **PASSED** (`useOrderHistory.test.ts`) |
| 10 | **Public Queue Monitor Board** | Papan antrean publik 3 kolom (*Menunggu*, *Sedang Diproses*, *Siap Diambil*) dilengkapi indikator kepadatan stan kantin (*Sepi*, *Sedang*, *Ramai*). | *Sebagai mahasiswa dan civitas kampus, saya ingin memantau antrean publik kantin agar saya dapat memperkirakan waktu tunggu antrean.* | **COMPLETED** | **PASSED** (`api.test.ts`, `components.test.tsx`) |
| 11 | **Seller Order Management Dashboard** | Dashboard pengelola kantin untuk memantau pesanan masuk, memajukan status pesanan (`WAITING` &rarr; `PROCESSING` &rarr; `READY` &rarr; `COMPLETED`), membatalkan pesanan, dan merekap omset. | *Sebagai penjual kantin, saya ingin mengelola antrean pesanan yang masuk dan mengubah statusnya agar proses memasak terkoordinasi rapi.* | **COMPLETED** | **PASSED** (`api.test.ts`) |
| 12 | **Menu Item Management (CRUD & Stock)** | Pengelolaan menu kantin oleh penjual untuk menambah menu baru, mengedit nama/harga/deskripsi, menghapus menu, dan mengubah status ketersediaan stok secara instan. | *Sebagai penjual kantin, saya ingin mengubah ketersediaan menu jika stok bahan habis agar pembeli tidak memesan menu yang tidak tersedia.* | **COMPLETED** | **PASSED** (`api.test.ts`, `validation.test.ts`) |
| 13 | **Canteen QR Code Display** | Penyediaan halaman QR Code stan kantin yang dapat ditampilkan pada tablet/layar stan atau dicetak untuk dipindai oleh smartphone mahasiswa. | *Sebagai pengelola kantin, saya ingin menampilkan QR Code stan kantin agar mahasiswa dapat memindai dan langsung membuka halaman pemesanan.* | **COMPLETED** | **PASSED** (`api.test.ts`) |
| 14 | **Offline/Mock Resilience & Persistence** | Mekanisme fallback cerdas dengan persistence `localStorage` sehingga seluruh alur demo berjalan mulus dan konsisten bahkan ketika Docker/MySQL tidak aktif. | *Sebagai penguji dan dosen evaluator, saya ingin aplikasi tetap dapat didemonstrasikan dengan lancar tanpa terhambat dependensi database lokal.* | **COMPLETED** | **PASSED** (`api.test.ts`, `useCart.test.ts`, `useOrderHistory.test.ts`) |

---

## 📈 Ringkasan Verifikasi Pengujian Unit Test

* **Total Test Suites**: 5 Berkas Pengujian
* **Total Unit Tests**: 46 Kasus Uji
* **Tingkat Kelulusan**: **100% (46 PASSED / 0 FAILED)**
* **Waktu Eksekusi**: ~17 detik

```text
✓ apps/web/src/test/validation.test.ts        (17 tests) - PASSED
✓ apps/web/src/test/useCart.test.ts           (8 tests)  - PASSED
✓ apps/web/src/test/components.test.tsx       (10 tests) - PASSED
✓ apps/web/src/test/api.test.ts               (6 tests)  - PASSED
✓ apps/web/src/test/useOrderHistory.test.ts   (5 tests)  - PASSED
```

---

## 🎯 Kesimpulan Kesiapan Rilis MVP (P7)

Semua fungsionalitas inti yang disyaratkan dalam spesifikasi proyek Rekayasa Perangkat Lunak P7 telah terimplementasi secara tuntas (*End-to-End*), terhubung erat antara antarmuka pengguna, status keranjang belanja, penerbitan nomor antrean digital, pemantauan dapur, hingga dashboard kasir.
