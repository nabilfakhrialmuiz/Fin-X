<div align="center">

<img src="./assets/images/icon.png" alt="Fin-X Logo" width="120"/>

# FIN-X

### _Your Personal Finance Command Center_

[![Version](https://img.shields.io/badge/version-1.5.1-00F0FF?style=for-the-badge&logo=github&logoColor=white)](https://github.com/nabilfakhrialmuiz/Fin-X)
[![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS-00FF66?style=for-the-badge&logo=android&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev)
[![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Cloud%20Powered-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![License](https://img.shields.io/badge/license-MIT-FF003C?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](LICENSE)

**Aplikasi manajemen keuangan pribadi futuristik berbasis React Native & Firebase.**
Lacak, analisis, dan kelola keuangan kamu dengan tampilan Neon Cyberpunk yang memukau.

[Cara Install](#cara-instalasi) &nbsp;·&nbsp; [Fitur Utama](#fitur-utama) &nbsp;·&nbsp; [Kontribusi](#kontribusi)

---

</div>

## Fitur Utama

| Fitur                    | Deskripsi                                                                       |
| ------------------------ | ------------------------------------------------------------------------------- |
| **Dashboard Cerdas**     | Ringkasan saldo, pemasukan & pengeluaran, serta semua dompet dalam satu layar   |
| **Analitik Visual**      | Grafik Pie Chart & Line Chart interaktif untuk melihat tren keuangan per bulan  |
| **Catat Transaksi**      | Input pemasukan & pengeluaran lengkap dengan kategori, sumber dana, dan tanggal |
| **Manajemen Dompet**     | Kelola Dompet Tunai, Rekening Bank, E-Wallet, dan Crypto Wallet sekaligus       |
| **Target Tabungan**      | Buat dan pantau progres tujuan keuangan (Goals)                                 |
| **Manajemen Hutang**     | Catat dan pantau hutang piutang agar tidak ada yang terlewat                    |
| **Export Laporan PDF**   | Generate & bagikan laporan keuangan bulanan dalam format PDF                    |
| **Keamanan Biometrik**   | Lindungi aplikasi dengan Sidik Jari / Face ID                                   |
| **Real-time Sync**       | Data tersinkronisasi secara real-time ke Cloud Firestore                        |
| **Dark Mode Futuristik** | Tampilan Neon Cyberpunk yang modern dan memukau                                 |

---

## Teknologi yang Digunakan

| Teknologi                                                                                                                                                                                      | Keterangan                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| [![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactnative.dev)                                             | Framework utama lintas platform (Android & iOS)  |
| [![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev)                                                                     | Toolchain & ekosistem development                |
| [![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com)                                                  | Login, Register, dan Reset Password              |
| [![Firestore](https://img.shields.io/badge/Cloud-Firestore-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/products/firestore)                            | Database real-time berbasis cloud                |
| [![JavaScript](https://img.shields.io/badge/react--native--chart--kit-6.12.2-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://github.com/indiespirit/react-native-chart-kit) | Visualisasi grafik Pie & Line Chart              |
| [![Reanimated](https://img.shields.io/badge/Reanimated-4.1.1-7C3AED?style=flat-square&logo=react&logoColor=white)](https://docs.swmansion.com/react-native-reanimated/)                        | Animasi halus dan interaktif                     |
| [![Google Fonts](https://img.shields.io/badge/Google%20Fonts-Orbitron-4285F4?style=flat-square&logo=google&logoColor=white)](https://fonts.google.com/specimen/Orbitron)                       | Font futuristik khas Fin-X                       |
| [![Expo](https://img.shields.io/badge/expo--local--authentication-Biometric-000020?style=flat-square&logo=expo&logoColor=white)](https://docs.expo.dev/sdk/local-authentication/)              | Autentikasi biometrik (Fingerprint/Face ID)      |
| [![AsyncStorage](https://img.shields.io/badge/AsyncStorage-Local%20Storage-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react-native-async-storage.github.io/async-storage/)  | Penyimpanan preferensi lokal di perangkat        |
| [![Gesture Handler](https://img.shields.io/badge/Gesture%20Handler-2.28.0-7C3AED?style=flat-square&logo=react&logoColor=white)](https://docs.swmansion.com/react-native-gesture-handler/)      | Gesture swipe untuk interaksi yang lebih natural |

---

## Halaman Aplikasi

| Halaman                 | Deskripsi                                              |
| ----------------------- | ------------------------------------------------------ |
| **Login / Register**    | Masuk atau buat akun baru dengan email & password      |
| **Lupa Sandi**          | Reset password melalui email                           |
| **Beranda (Dashboard)** | Ringkasan saldo, dompet, goals, dan transaksi terkini  |
| **Tambah Transaksi**    | Input pemasukan atau pengeluaran baru                  |
| **Analitik**            | Grafik dan statistik keuangan bulanan                  |
| **Debt**                | Manajemen hutang piutang                               |
| **Pengaturan**          | Profil, keamanan biometrik, ganti password, hapus akun |

---

## Cara Instalasi

### Prasyarat

Pastikan kamu sudah menginstal tools berikut sebelum memulai:

- [![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/) versi **18** atau lebih baru
- [![Git](https://img.shields.io/badge/Git-latest-F05032?style=flat-square&logo=git&logoColor=white)](https://git-scm.com/)
- Aplikasi [![Expo Go](https://img.shields.io/badge/Expo%20Go-Android%20%7C%20iOS-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev/go) di HP-mu

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

> **Cara mendapatkan konfigurasi Firebase:**
>
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

## Struktur Proyek

```
Fin-X/
├── App.js              # Seluruh kode aplikasi (komponen, navigasi, & logika)
├── app.json            # Konfigurasi Expo & metadata aplikasi
├── babel.config.js     # Konfigurasi transpiler Babel
├── eas.json            # Konfigurasi EAS Build (untuk build ke APK/IPA)
├── package.json        # Dependensi & skrip proyek
├── .gitignore          # Daftar file yang diabaikan Git
├── .env                # File rahasia (TIDAK ter-upload ke GitHub)
└── assets/
    └── images/         # Ikon & aset gambar aplikasi
```

---

## Catatan Keamanan

> **File `.env` tidak akan pernah ter-upload ke GitHub** karena sudah terdaftar di `.gitignore`.
> Setiap orang yang meng-clone repositori ini **wajib** membuat file `.env` sendiri (lihat Langkah 3).
> Jangan pernah membagikan isi file `.env`-mu kepada siapapun.

---

## Kontribusi

Kontribusi sangat terbuka dan diterima dengan senang hati!

1. **Fork** repositori ini
2. Buat branch fitur baru: `git checkout -b fitur/NamaFitur`
3. Commit perubahanmu: `git commit -m 'Menambahkan fitur baru'`
4. Push ke branch: `git push origin fitur/NamaFitur`
5. Buat **Pull Request**

---

## Lisensi

[![MIT License](https://img.shields.io/badge/license-MIT-FF003C?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](LICENSE)

Proyek ini dilisensikan di bawah lisensi **MIT**.

---

<div align="center">

Dibuat dengan ❤️ oleh **[Nabil Fakhri Al Muiz](https://github.com/nabilfakhrialmuiz)**

[![GitHub followers](https://img.shields.io/github/followers/nabilfakhrialmuiz?style=social)](https://github.com/nabilfakhrialmuiz)
[![GitHub stars](https://img.shields.io/github/stars/nabilfakhrialmuiz/Fin-X?style=social)](https://github.com/nabilfakhrialmuiz/Fin-X/stargazers)

</div>
