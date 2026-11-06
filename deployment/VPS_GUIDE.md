# 🐧 Panduan Deployment VPS & Raspberry Pi — KantinQ (P9)

Dokumentasi resmi langkah demi langkah (*step-by-step guide*) untuk melakukan deployment aplikasi web **KantinQ** pada server Linux (Ubuntu / Debian / Raspberry Pi OS) yang dapat diakses secara aman melalui subpath:
$$\text{https://<SERVER\_IP>/kantinq}$$

---

## 📑 Daftar Isi
1. [Spesifikasi & Prasyarat Sistem](#1-spesifikasi--prasyarat-sistem)
2. [Langkah 1: Instalasi Web Server Nginx](#langkah-1-instalasi-web-server-nginx)
3. [Langkah 2: Pembuatan Sertifikat SSL Self-Signed (HTTPS)](#langkah-2-pembuatan-sertifikat-ssl-self-signed-https)
4. [Langkah 3: Pembuatan Direktori & Transfer Build Artefak (`dist`)](#langkah-3-pembuatan-direktori--transfer-build-artefak-dist)
5. [Langkah 4: Konfigurasi Virtual Host Nginx](#langkah-4-konfigurasi-virtual-host-nginx)
6. [Langkah 5: Pengujian Konfigurasi & Restart Nginx](#langkah-5-pengujian-konfigurasi--restart-nginx)
7. [Langkah 6: Konfigurasi Firewall (UFW)](#langkah-6-konfigurasi-firewall-ufw)
8. [Langkah 7: Verifikasi Akses Melalui Web Browser](#langkah-7-verifikasi-akses-melalui-web-browser)
9. [Troubleshooting & Pemecahan Masalah](#troubleshooting--pemecahan-masalah)

---

## 1. Spesifikasi & Prasyarat Sistem

- **Sistem Operasi Target:** Ubuntu 20.04/22.04/24.04 LTS, Debian 11/12, atau Raspberry Pi OS (64-bit disarankan).
- **Akses:** Akses SSH dengan hak akses `sudo`.
- **Artefak Build:** Folder `dist` hasil kompilasi `npm run build:web` pada mesin lokal / CI (`apps/web/dist`).
- **Base Path:** Aplikasi telah dikonfigurasi dengan `base: '/kantinq/'` pada [`vite.config.ts`](file:///d:/Kuliah/RPL/apps/web/vite.config.ts).

---

## Langkah 1: Instalasi Web Server Nginx

Hubungkan diri Anda ke server VPS atau Raspberry Pi via SSH:
```bash
ssh username@<SERVER_IP>
```

Perbarui daftar paket repositori dan instal Nginx:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx openssl
```

Pastikan Nginx telah terpasang dan service berjalan:
```bash
sudo systemctl enable nginx
sudo systemctl status nginx
```

---

## Langkah 2: Pembuatan Sertifikat SSL Self-Signed (HTTPS)

Untuk memenuhi kriteria tugas deployment berbasis HTTPS tanpa domain publik (menggunakan IP langsung), kita membuat sertifikat SSL *Self-Signed* menggunakan **OpenSSL**:

```bash
# 1. Pastikan direktori certificate dan private key tersedia
sudo mkdir -p /etc/ssl/certs
sudo mkdir -p /etc/ssl/private

# 2. Generate private key dan self-signed certificate (berlaku 365 hari)
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/kantinq-selfsigned.key \
  -out /etc/ssl/certs/kantinq-selfsigned.crt \
  -subj "/C=ID/ST=Jawa Barat/L=Bandung/O=Universitas/OU=Teknik Informatika RPL/CN=<SERVER_IP>"

# 3. Kunci hak akses private key demi keamanan (hanya root yang boleh membaca)
sudo chmod 600 /etc/ssl/private/kantinq-selfsigned.key
sudo chmod 644 /etc/ssl/certs/kantinq-selfsigned.crt
```
*(Catatan: Ganti `<SERVER_IP>` pada parameter `-subj` dengan alamat IP server Anda, misalnya `192.168.1.50` atau IP VPS publik).*

---

## Langkah 3: Pembuatan Direktori & Transfer Build Artefak (`dist`)

### A. Di Sisi Server (VPS / Raspberry Pi)
Siapkan direktori target `/var/www/html/kantinq`:
```bash
sudo mkdir -p /var/www/html/kantinq
sudo chown -R $USER:$USER /var/www/html/kantinq
```

### B. Di Sisi Mesin Lokal Developer (Windows / macOS / Linux)
Pastikan Anda telah menjalankan build di mesin lokal:
```bash
# Jalankan build web dari root project KantinQ
npm run build:web
```

Transfer seluruh isi folder `apps/web/dist` ke server menggunakan `scp` atau `rsync`:
```bash
# Menggunakan SCP (jalankan di terminal lokal):
scp -r apps/web/dist/* username@<SERVER_IP>:/var/www/html/kantinq/

# Atau alternatif jika menggunakan RSYNC:
# rsync -avz apps/web/dist/ username@<SERVER_IP>:/var/www/html/kantinq/
```

### C. Di Sisi Server: Set Kepemilikan & Hak Akses Web Server
Kembalikan kepemilikan file ke user web server `www-data`:
```bash
sudo chown -R www-data:www-data /var/www/html/kantinq
sudo chmod -R 755 /var/www/html/kantinq
```

Verifikasi bahwa file `index.html` dan folder `assets` telah berada di tempatnya:
```bash
ls -la /var/www/html/kantinq
# Output harus menampilkan index.html dan folder assets/
```

---

## Langkah 4: Konfigurasi Virtual Host Nginx

Salin file konfigurasi [`deployment/nginx.conf`](file:///d:/Kuliah/RPL/deployment/nginx.conf) dari repositori ini ke direktori konfigurasi Nginx:

```bash
# Salin file nginx.conf ke sites-available
sudo cp deployment/nginx.conf /etc/nginx/sites-available/kantinq

# Aktifkan konfigurasi dengan membuat symbolic link ke sites-enabled
sudo ln -sf /etc/nginx/sites-available/kantinq /etc/nginx/sites-enabled/kantinq

# Nonaktifkan default site Nginx bawaan agar tidak konflik
sudo rm -f /etc/nginx/sites-enabled/default
```

### Inti Konfigurasi Subpath `/kantinq`:
```nginx
location /kantinq {
    alias /var/www/html/kantinq/;
    index index.html;
    try_files $uri $uri/ /kantinq/index.html;
}
```
*Baris `try_files $uri $uri/ /kantinq/index.html;` sangat krusial untuk Single Page Application (SPA). Jika pengguna me-refresh halaman pada sub-rute client (seperti `/kantinq/?canteenId=1`), Nginx tetap mengarahkan request ke `index.html` tanpa memicu error HTTP 404.*

---

## Langkah 5: Pengujian Konfigurasi & Restart Nginx

Selalu uji sintaks konfigurasi Nginx sebelum me-restart service:
```bash
sudo nginx -t
```
*Output wajib:*
```text
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

Jika sintaks valid, restart service Nginx:
```bash
sudo systemctl restart nginx
```

Periksa status layanan:
```bash
sudo systemctl status nginx --no-pager
```

---

## Langkah 6: Konfigurasi Firewall (UFW)

Jika server menggunakan firewall `ufw`, izinkan lalu lintas HTTP (port 80) dan HTTPS (port 443):
```bash
sudo ufw allow 'Nginx Full'
# atau manual:
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
sudo ufw status
```

---

## Langkah 7: Verifikasi Akses Melalui Web Browser

1. Buka browser pada komputer atau smartphone (yang berada dalam satu jaringan dengan Raspberry Pi atau memiliki akses internet ke VPS).
2. Kunjungi alamat:
   ```text
   https://<SERVER_IP>/kantinq/
   ```
   Atau jika mengetikkan `http://<SERVER_IP>/kantinq/`, Nginx akan secara otomatis mengalihkan (*redirect 301*) ke `https://`.
3. **Peringatan Sertifikat SSL (Self-Signed Warning):**  
   Karena sertifikat dibuat secara mandiri tanpa CA publik, browser akan menampilkan peringatan keamanan (`Your connection is not private` / `Potential Security Risk Ahead`).  
   - Klik **Advanced** (Lanjutan).
   - Klik **Proceed to `<SERVER_IP>` (unsafe)** / **Accept the Risk and Continue**.
4. Aplikasi **KantinQ** akan tampil secara sempurna dengan seluruh asset (JS, CSS, Icons, Fonts) termuat dari subpath `/kantinq/assets/...`.
5. Uji fungsionalitas pemesanan, filter menu, dan penambahan item ke keranjang.

---

## 🛠️ Troubleshooting & Pemecahan Masalah

### 1. Error 403 Forbidden saat membuka `/kantinq`
- **Penyebab:** Hak akses folder tidak dapat dibaca oleh user `www-data`.
- **Solusi:**
  ```bash
  sudo chown -R www-data:www-data /var/www/html/kantinq
  sudo chmod -R 755 /var/www/html/kantinq
  ```

### 2. Error 404 Not Found saat Refresh Halaman
- **Penyebab:** Direktif `try_files` belum dikonfigurasi dengan benar.
- **Solusi:** Pastikan blok `location /kantinq` memiliki:
  ```nginx
  alias /var/www/html/kantinq/;
  try_files $uri $uri/ /kantinq/index.html;
  ```

### 3. Halaman Putih / Asset MIME Type Mismatch (`Failed to load module script`)
- **Penyebab:** Aplikasi dibangun dengan root path `/` bukan subpath `/kantinq/`.
- **Solusi:** Pastikan file `apps/web/vite.config.ts` memuat `base: '/kantinq/'`, lalu build ulang `npm run build:web` dan salin ulang file `dist`.

### 4. Memeriksa Log Kesalahan Nginx
Untuk melihat error secara real-time saat melakukan debug:
```bash
sudo tail -f /var/log/nginx/kantinq_error.log
sudo tail -f /var/log/nginx/kantinq_access.log
```

---
*KantinQ DevSecOps Deployment Team — University Assignment P9.*

