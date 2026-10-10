<div align="center">

<img src="./assets/images/icon.png" alt="Fin-X Logo" width="120"/>

# ⚡ FIN-X
### *Your Personal Finance Command Center*

[![Version](https://img.shields.io/badge/version-1.5.1-00F0FF?style=for-the-badge&logo=github)](https://github.com/nabilfakhrialmuiz/Fin-X)
[![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS-00FF66?style=for-the-badge&logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=for-the-badge&logo=react)](https://reactnative.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Cloud%20Powered-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com)
[![License](https://img.shields.io/badge/license-MIT-FF003C?style=for-the-badge)](LICENSE)

**Aplikasi manajemen keuangan pribadi futuristik berbasis React Native & Firebase.**
Lacak, analisis, dan kelola keuangan kamu dengan tampilan Neon Cyberpunk yang memukau. 🚀

[📥 Cara Install](#-cara-instalasi) · [✨ Fitur](#-fitur-utama) · [🤝 Kontribusi](#-kontribusi)

---

</div>

## ✨ Fitur Utama

| Fitur | Deskripsi |
|---|---|
| 🏠 **Dashboard Cerdas** | Ringkasan saldo, pemasukan & pengeluaran, serta semua dompet dalam satu layar |
| 📊 **Analitik Visual** | Grafik Pie Chart & Line Chart interaktif untuk melihat tren keuangan per bulan |
| 💸 **Catat Transaksi** | Input pemasukan & pengeluaran lengkap dengan kategori, sumber dana, dan tanggal |
| 💼 **Manajemen Dompet** | Kelola Dompet Tunai, Rekening Bank, E-Wallet, dan Crypto Wallet sekaligus |
| 🎯 **Target Tabungan** | Buat dan pantau progres tujuan keuangan (Goals) |
| 📋 **Manajemen Hutang** | Catat dan pantau hutang piutang agar tidak ada yang terlewat |
| 📄 **Export Laporan PDF** | Generate & bagikan laporan keuangan bulanan dalam format PDF |
| 🔐 **Keamanan Biometrik** | Lindungi aplikasi dengan Sidik Jari / Face ID |
| 🔄 **Real-time Sync** | Data tersinkronisasi secara real-time ke Cloud Firestore |
| 🌙 **Dark Mode Futuristik** | Tampilan Neon Cyberpunk yang modern dan memukau |

---

## 🛠️ Teknologi yang Digunakan

| Teknologi | Keterangan |
|---|---|
| ⚛️ **React Native 0.81.5** | Framework utama lintas platform (Android & iOS) |
| 🎯 **Expo SDK 54** | Toolchain & ekosistem development |
| 🔥 **Firebase Authentication** | Login, Register, dan Reset Password |
| ☁️ **Cloud Firestore** | Database real-time berbasis cloud |
| 📊 **react-native-chart-kit** | Visualisasi grafik Pie & Line Chart |
| 🎨 **react-native-reanimated** | Animasi halus dan interaktif |
| 🔠 **Orbitron Font** | Font futuristik khas Fin-X |
| 🔑 **expo-local-authentication** | Autentikasi biometrik (Fingerprint/Face ID) |
| 💾 **AsyncStorage** | Penyimpanan preferensi lokal di perangkat |
| 👆 **react-native-gesture-handler** | Gesture swipe untuk interaksi yang lebih natural |

---

## 📱 Halaman Aplikasi

| Halaman | Deskripsi |
|---|---|
| 🔐 **Login / Register** | Masuk atau buat akun baru dengan email & password |
| 🔑 **Lupa Sandi** | Reset password melalui email |
| 🏠 **Beranda (Dashboard)** | Ringkasan saldo, dompet, goals, dan transaksi terkini |
| ➕ **Tambah Transaksi** | Input pemasukan atau pengeluaran baru |
| 📊 **Analitik** | Grafik dan statistik keuangan bulanan |
| 📋 **Debt** | Manajemen hutang piutang |
| ⚙️ **Pengaturan** | Profil, keamanan biometrik, ganti password, hapus akun |

---

## 📥 Cara Instalasi

### Prasyarat

Pastikan kamu sudah menginstal tools berikut sebelum memulai:

- [Node.js](https://nodejs.org/) versi **18** atau lebih baru
- [Git](https://git-scm.com/)
- Aplikasi **Expo Go** di HP ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779))

### Langkah-langkah

**1. Clone repositori ini**
```bash
git clone https://github.com/nabilfakhrialmuiz/Fin-X.git
cd Fin-X
```

**2. Install semua dependensi**
```bash
npm install
```

**3. Buat dan konfigurasi file `.env`**

Buat file bernama `.env` di folder utama proyek, lalu isi dengan konfigurasi Firebase milikmu:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=masukkan_api_key_kamu
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=masukkan_auth_domain_kamu
EXPO_PUBLIC_FIREBASE_PROJECT_ID=masukkan_project_id_kamu
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=masukkan_storage_bucket_kamu
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=masukkan_sender_id_kamu
EXPO_PUBLIC_FIREBASE_APP_ID=masukkan_app_id_kamu
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=masukkan_measurement_id_kamu
```

> **💡 Cara mendapatkan konfigurasi Firebase:**
> 1. Buka [Firebase Console](https://console.firebase.google.com/) dan buat project baru
> 2. Aktifkan **Authentication** (metode Email/Password) di menu Build > Authentication
> 3. Aktifkan **Cloud Firestore** di menu Build > Firestore Database
> 4. Masuk ke **Project Settings > General > Your Apps**, lalu salin konfigurasinya ke file `.env`

**4. Jalankan aplikasi**
```bash
npx expo start --clear
```

**5. Buka di HP-mu**

Scan QR code yang muncul di terminal menggunakan aplikasi **Expo Go**.
> Pastikan HP dan laptop/PC terhubung ke **WiFi yang sama**.

---

## 📁 Struktur Proyek

```
Fin-X/
├── App.js              # Seluruh kode aplikasi (komponen, navigasi, & logika)
├── app.json            # Konfigurasi Expo & metadata aplikasi
├── babel.config.js     # Konfigurasi transpiler Babel
├── eas.json            # Konfigurasi EAS Build (untuk build ke APK/IPA)
├── package.json        # Dependensi & skrip proyek
├── .gitignore          # Daftar file yang diabaikan Git
├── .env                # ⚠️ File rahasia (TIDAK ter-upload ke GitHub)
└── assets/
    └── images/         # Ikon & aset gambar aplikasi
```

---

## ⚠️ Catatan Keamanan

> **File `.env` tidak akan pernah ter-upload ke GitHub** karena sudah terdaftar di `.gitignore`.
> Setiap orang yang meng-clone repositori ini **wajib** membuat file `.env` sendiri (lihat Langkah 3).
> Jangan pernah membagikan isi file `.env`-mu kepada siapapun.

---

## 🤝 Kontribusi

Kontribusi sangat terbuka dan diterima dengan senang hati!

1. **Fork** repositori ini
2. Buat branch fitur baru: `git checkout -b fitur/NamaFitur`
3. Commit perubahanmu: `git commit -m 'Menambahkan fitur baru'`
4. Push ke branch: `git push origin fitur/NamaFitur`
5. Buat **Pull Request**

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah lisensi **MIT**.

---

<div align="center">

Dibuat dengan ❤️ oleh **[Nabil Fakhri Al Muiz](https://github.com/nabilfakhrialmuiz)**

⭐ **Jika aplikasi ini berguna bagimu, jangan lupa kasih Star!** ⭐

</div>
