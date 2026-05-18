# RajaWash - Web Dashboard Application

## 📌 Deskripsi Aplikasi
Aplikasi antarmuka web (Frontend Web) ini dirancang khusus untuk ekosistem RajaWash. Web Apps ini difokuskan pada manajemen operasional, tampilan portal kasir/admin, dan pemantauan tugas-tugas kurir secara real-time. Sistem ini membantu pengelolaan bisnis laundry menjadi lebih modern, efisien, dan terintegrasi dalam satu dashboard management.

## 🚀 Teknologi Utama
- **Framework Utama**: React JS (dibundel dan dijalankan menggunakan Vite)
- **Styling**: Tailwind CSS & PostCSS
- **Routing**: React Router DOM (`react-router-dom`)
- **State Management**: Zustand / Redux (Sesuai kebutuhan)
- **HTTP Client**: Axios
- **Authentication**: JWT Authentication
- **Integrasi Pembayaran**: Midtrans (QRIS, E-Wallet, VA, dll)
- **Ikon & Komponen Tambahan**: Lucide React, React Hot Toast, QRCode React

## 🎯 Tujuan Web Apps
Web aplikasi ini dibuat untuk:
- Monitoring seluruh pesanan laundry secara real-time
- Mengelola data user (tambah, edit, hapus, role) dan mitra
- Mengontrol transaksi dan sistem kasir digital
- Mengelola CRUD pesanan laundry dan riwayat pembayaran

## 👨‍💼 Fitur Owner Dashboard
- **Dashboard Monitoring**: Melihat total pesanan, pendapatan, statistik, dan grafik pemasukan.
- **Management User**: CRUD user dan role management.
- **Management Pesanan**: Membuat pesanan, update status, dan riwayat transaksi.
- **Monitoring Mitra**: Melacak aktivitas mitra dan progress pengerjaan.
- **Sistem Kasir Digital**: Input transaksi, cetak invoice, dan integrasi Midtrans.

## 📁 Struktur Folder Utama
- `src/`: Folder utama kode sumber React.
  - `pages/`: Halaman/rute aplikasi tingkat atas (misalnya `CourierTasks.jsx`, dasbor admin).
  - `components/`: Komponen UI yang dapat digunakan kembali secara global.
  - `assets/`: Berkas statis (gambar, ikon, logo).
  - `layouts/`, `services/`, `hooks/`, `context/`, `utils/`: Pembagian logika arsitektural.
- `public/`: Berkas publik murni yang tidak akan diproses oleh bundler (seperti `index.html`).
- `tailwind.config.js`: Konfigurasi tema, palet warna, dan sistem desain.
- `vite.config.js`: Pengaturan bundler dan server dev.

## 💻 Cara Menjalankan
1. Pastikan Node.js terinstal.
2. Masuk ke direktori `frontend_web`.
3. Install dependencies: `npm install`
4. Jalankan server lokal: `npm run dev`
5. Build untuk production: `npm run build`
6. Pratinjau hasil build: `npm run preview`
