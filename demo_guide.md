# 🎬 Panduan Perekaman Video Demo KantinQ (demo_guide.md)

Naskah dan skenario panduan perekaman layar (*screen recording script*) untuk pembuatan berkas presentasi demonstrasi **`demo.mp4`** (Tugas Besar RPL - P7 Final Release).

---

## 🎥 Informasi Perekaman

* **Nama Berkas Output**: `demo.mp4`
* **Target Durasi**: 2 menit 30 detik s/d 3 menit 30 detik
* **Rasio Layar**: 16:9 (1920×1080 Full HD disarankan)
* **Aplikasi Perekam**: OBS Studio / Windows Game Bar (`Win + G`) / Screen Recorder bawaan
* **Persiapan Sebelum Merekam**:
  1. Jalankan web server: `npm run dev:web` (buka [http://localhost:5173](http://localhost:5173)).
  2. Buka browser dalam mode *Clean Profile* atau Incognito/Private (Ctrl+Shift+N) agar ekstensi browser tidak mengganggu tampilan.
  3. Set resolusi browser ke 100% zoom.
  4. Siapkan dua jendela browser berdampingan (*split screen*) jika ingin mendemonstrasikan interaksi Mahasiswa vs Penjual secara bersamaan.

---

## ⏱️ Skenario & Naskah Perekaman (Scene-by-Scene)

### 📌 Bagian 1: Pengenalan & Akses Kantin (00:00 - 00:25)
* **Tindakan Visual**:
  * Tampilkan tab **QR Kantin** (`tab=canteen`).
  * Perlihatkan judul stan *"Kantin Barokah Mbok Darmi"* dan QR Code pemesanan stan.
  * Jelaskan secara verbal/teks bahwa mahasiswa cukup memindai QR Code di stan meja kasir untuk membuka aplikasi tanpa perlu download app native.
  * Klik tombol **"Buka Halaman Pemesanan"** atau klik tab **"Pesan Menu"**.
* **Poin Narasi**:
  > *"Halo semuanya, ini adalah demonstrasi akhir aplikasi KantinQ — Sistem Pemesanan dan Antrean Digital Kantin Kampus berbasis QR Code. Alur dimulai saat mahasiswa tiba di stan kantin dan memindai QR Code yang disediakan."*

---

### 📌 Bagian 2: Eksplorasi Menu, Filter & Validasi Keranjang (00:25 - 01:10)
* **Tindakan Visual**:
  * Di tab **Pesan Menu**, tunjukkan kartu informasi kondisi stan (misal: *Antrean Sepi / Sedang*).
  * Ketik pada kotak pencarian: ketik `"Ayam"`, tunjukkan hasil pencarian menu instan.
  * Klik tombol filter kategori: klik **"Minuman"** (daftar berubah menampilkan minuman), lalu klik **"Tersedia"**.
  * Klik tombol **"Reset Pencarian & Filter"** untuk mengembalikan semua menu.
  * Pilih menu makanan: Klik **"+ Tambah"** pada *Nasi Ayam Geprek Sambal Bawang*.
  * Naikkan porsi menjadi 2 porsi menggunakan tombol `+`.
  * Tambahkan 1 porsi *Es Teh Manis Jumbo*.
  * Tunjukkan pada sisi kanan: subtotal dan total pembayaran otomatis terhitung (*Rp 40.000*).
  * **Uji Validasi Error**:
    * Kosongkan kolom Nama Pemesan, klik tombol **"Buat Pesanan"**.
    * Tunjukkan pesan error validasi muncul: *"Nama pemesan wajib diisi"*.
    * Masukkan nama hanya angka atau 1 huruf: perlihatkan validasi *"Nama pemesan minimal 2 karakter dan mengandung huruf"*.
    * Ketik nama pemesan yang valid: `"Budi Santoso (NIM 210123)"`.
* **Poin Narasi**:
  > *"Mahasiswa dapat mencari makanan favorit, memfilter kategori makanan atau minuman, dan mengatur jumlah porsi di keranjang belanja. Sistem dilengkapi validasi ketat agar pesanan yang dikirimkan selalu valid."*

---

### 📌 Bagian 3: Checkout & Tiket Antrean Digital (01:10 - 01:45)
* **Tindakan Visual**:
  * Klik tombol **"Buat Pesanan"**.
  * Tunjukkan loading indicator *"Memproses Pesanan..."*.
  * Halaman otomatis berpindah ke **Tiket Antrean Digital** (`OrderConfirmationPage`).
  * Sorot elemen utama tiket:
    * **Nomor Antrean Jumbo**: misal `A-001` atau `A-005`.
    * **Nama Pemesan**: `Budi Santoso`.
    * **Badge Status**: `MENUNGGU` (kuning).
    * **Interactive Step Tracker**: 4 tahap (Menunggu &rarr; Diproses &rarr; Siap Diambil &rarr; Selesai).
    * **Rincian Pesanan**: Nasi Ayam Geprek × 2, Es Teh Manis × 1.
    * **Instruksi Kasir**: Pembayaran tunai/QRIS langsung dilakukan saat pengambilan makanan di kasir.
    * **Indikator Auto-Polling**: Tunjukkan keterangan *"Status diperbarui secara otomatis setiap 4 detik"*.
* **Poin Narasi**:
  > *"Setelah checkout, mahasiswa langsung menerima tiket antrean digital dengan nomor antrean yang dihasilkan secara otomatis. Mahasiswa dapat duduk santai sambil memantau status pengerjaan makanan mereka."*

---

### 📌 Bagian 4: Riwayat "Pesanan Saya" (01:45 - 02:05)
* **Tindakan Visual**:
  * Klik tab **"Pesanan Saya"** pada Navbar.
  * Perlihatkan bahwa pesanan Budi Santoso yang baru saja dibuat tersimpan secara otomatis di `localStorage` perangkat.
  * Tunjukkan tombol **"Segarkan Status"** untuk memeriksa pembaruan status dari kasir.
  * Klik kartu pesanan tersebut untuk membuktikan bahwa tiket antrean digital dapat dibuka kembali kapan saja.
* **Poin Narasi**:
  > *"Semua pesanan tersimpan di tab 'Pesanan Saya'. Jika browser ditutup atau di-refresh, mahasiswa tidak kehilangan nomor antreannya dan dapat membukanya kembali kapan saja."*

---

### 📌 Bagian 5: Papan Antrean Digital Publik (02:05 - 02:25)
* **Tindakan Visual**:
  * Klik tab **"Pantau Antrean"** (`QueueMonitorPage`).
  * Perlihatkan banner kondisi stan dan total antrean aktif.
  * Tunjukkan 3 kolom digital board:
    1. Kolom *Menunggu* (berisi nomor antrean mahasiswa).
    2. Kolom *Sedang Diproses*.
    3. Kolom *Siap Diambil*.
* **Poin Narasi**:
  > *"Halaman Pantau Antrean dapat ditampilkan pada TV monitor di aula kantin agar seluruh mahasiswa dapat melihat situasi antrean secara transparan."*

---

### 📌 Bagian 6: Pengelolaan Antrean di Dashboard Penjual (02:25 - 03:00)
* **Tindakan Visual**:
  * Klik tab **"Dashboard Penjual"** (`SellerDashboardPage`).
  * Tunjukkan 6 kartu ringkasan: Pesanan Hari Ini, Antrean Menunggu, Sedang Diproses, Siap Diambil, Selesai, dan Total Omset Harian.
  * Cari pesanan Budi Santoso:
    1. Klik tombol **"Mulai Masak"**: status berubah menjadi `DIPROSES`.
    2. Klik tombol **"Pesanan Siap"**: status berubah menjadi `SIAP DIAMBIL`.
    3. Klik tab **"Pantau Antrean"** sebentar untuk membuktikan nomor antrean Budi berpindah ke kolom *Siap Diambil* dengan efek pulsing hijau.
    4. Kembali ke tiket mahasiswa untuk memperlihatkan banner hijau: *"PESANAN SIAP! Silakan ambil makanan Anda di stan kasir"*.
    5. Klik tombol **"Selesai Diambil"**: pesanan selesai dan masuk ke tab Riwayat Pesanan Penjual, serta menambah total omset pendapatan kantin.
* **Poin Narasi**:
  > *"Di sisi penjual, dashboard memudahkan dapur memajukan status pesanan dari memasak hingga siap diambil. Mahasiswa menerima notifikasi instan saat makanan siap diambil tanpa perlu dipanggil secara verbal."*

---

### 📌 Bagian 7: Pengujian Otomatis & Penutup (03:00 - 03:20)
* **Tindakan Visual**:
  * Tampilkan terminal VS Code / PowerShell.
  * Jalankan perintah:
    ```bash
    npm test
    ```
  * Perlihatkan seluruh 46 unit test lulus (**46 passed**).
  * Tutup video dengan tampilan aplikasi KantinQ yang bersih dan responsif.
* **Poin Narasi**:
  > *"Seluruh fitur inti KantinQ telah diuji melalui unit testing otomatis dengan 46 pengujian yang 100% lulus. Aplikasi siap digunakan sebagai solusi digitalisasi kantin kampus. Terima kasih!"*

---

## 💡 Tips Tambahan Saat Merekam

1. **Kecepatan Gerakan Kursor**: Gerakkan mouse dengan santai dan tidak terburu-buru agar penonton dapat mengikuti alur antarmuka dengan nyaman.
2. **Audio / Mic**: Jika merekam suara, gunakan headset atau mic yang jelas tanpa background noise. Jika tanpa suara, tambahkan subtitle/teks penjelasan singkat pada video editing.
3. **Format Video**: Simpan rekaman dalam format MP4 (H.264 / AAC) dengan nama berkas `demo.mp4`.
