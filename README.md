# 💰 Kas Kita — Aplikasi Pencatatan Kas Kelas

Aplikasi web pencatatan kas kelas berbasis **React + Spring Boot + Firebase**.  
Digunakan untuk mencatat pemasukan, pengeluaran, dan iuran anggota kelas secara digital.

---

## 🗂️ Struktur Project

```
kas kita/
├── backend/              # Spring Boot (Java 21) — REST API
│   └── src/main/
│       ├── java/com/kaskita/
│       └── resources/
│           ├── application.properties
│           └── firebase-service-account.json  ← (perlu diisi manual, tidak di-git)
├── frontend/             # React + Vite
│   ├── src/
│   └── .env              ← (perlu diisi manual, tidak di-git)
├── run-backend.bat       # Script jalankan backend (Windows)
└── run-frontend.bat      # Script jalankan frontend (Windows)
```

---

## ⚙️ Prasyarat (Wajib Install Dulu)

| Software | Versi | Link Download |
|----------|-------|---------------|
| **Java JDK** | 21 | [download.oracle.com](https://www.oracle.com/java/technologies/downloads/#java21) |
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org) |
| **Git** | terbaru | [git-scm.com](https://git-scm.com) |

> Cek apakah sudah terinstall dengan perintah:
> ```bash
> java -version
> node -v
> npm -v
> ```

---

## 🔥 Setup Firebase (Wajib — Dilakukan Sekali)

Project ini menggunakan **Firebase** sebagai database (Firestore) dan autentikasi (Firebase Auth).  
Kamu perlu meminta 2 file konfigurasi dari pemilik project:

### File 1: `firebase-service-account.json` (untuk Backend)

1. Minta file `firebase-service-account.json` dari pemilik project
2. Letakkan file tersebut di:
   ```
   backend/src/main/resources/firebase-service-account.json
   ```
   > ⚠️ File ini **rahasia** dan tidak boleh di-share ke publik / di-upload ke GitHub

### File 2: `.env` (untuk Frontend)

1. Buat file baru bernama `.env` di dalam folder `frontend/`
2. Isi dengan:
   ```env
   VITE_FIREBASE_API_KEY=isi_dengan_api_key_dari_pemilik_project
   ```
   > Minta nilai `VITE_FIREBASE_API_KEY` dari pemilik project

---

## 🚀 Cara Menjalankan Project

### Langkah 1 — Clone Repository

```bash
git clone <url-repository>
cd "kas kita"
```

### Langkah 2 — Setup File Konfigurasi

Pastikan kedua file konfigurasi Firebase sudah ada:
- ✅ `backend/src/main/resources/firebase-service-account.json`
- ✅ `frontend/.env`

### Langkah 3 — Install Dependensi Frontend

Buka terminal, masuk ke folder `frontend`, lalu jalankan:

```bash
cd frontend
npm install
```

> Proses ini hanya perlu dilakukan **sekali** (atau kalau ada perubahan `package.json`)

### Langkah 4 — Jalankan Backend

**Cara 1 — Klik dua kali file:**
```
run-backend.bat
```

**Cara 2 — Lewat terminal (dari root folder):**
```bash
.\run-backend.bat
```

Tunggu sampai muncul pesan:
```
Started KasKitaApplication in X.XXX seconds
```
Backend berjalan di → **http://localhost:8080**

### Langkah 5 — Jalankan Frontend

Buka **terminal baru** (jangan tutup terminal backend), lalu:

**Cara 1 — Klik dua kali file:**
```
run-frontend.bat
```

**Cara 2 — Lewat terminal:**
```bash
.\run-frontend.bat
```

Frontend berjalan di → **http://localhost:5173**

---

## 🌐 Akses Aplikasi

Buka browser dan kunjungi:
```
http://localhost:5173
```

### Cara Login / Daftar:
- **Daftar akun baru** → klik tombol "Daftar Akun Baru" di halaman login
- **Login** → masukkan email dan password yang sudah didaftarkan
- Saat pertama login, akun otomatis mendapat role **Anggota (Member)**
- Untuk menjadi **Admin/Bendahara**, minta pemilik project untuk mengubah role di Firebase Console

---

## 👥 Role Pengguna

| Role | Akses |
|------|-------|
| **ROLE_MEMBER** | Lihat dashboard, riwayat transaksi, status iuran |
| **ROLE_ADMIN** | Semua akses Member + tambah/edit transaksi, kelola iuran |

---

## 🛠️ Troubleshooting

### ❌ Backend tidak bisa start
- Pastikan **Java 21** sudah terinstall: `java -version`
- Pastikan file `firebase-service-account.json` sudah ada di `backend/src/main/resources/`
- Pastikan port `8080` tidak dipakai aplikasi lain

### ❌ Frontend error saat `npm install`
- Pastikan **Node.js versi 18+** terinstall: `node -v`
- Coba hapus folder `node_modules` lalu `npm install` ulang

### ❌ Login gagal / error 401
- Pastikan backend sudah berjalan di `http://localhost:8080`
- Pastikan file `.env` di folder `frontend/` sudah diisi dengan benar

### ❌ Halaman kosong / tidak bisa load data
- Buka DevTools browser (F12) → tab Console → lihat pesan error
- Pastikan kedua server (backend & frontend) sedang berjalan bersamaan

---

## 📋 Ringkasan Port

| Service | Port | URL |
|---------|------|-----|
| Backend (Spring Boot) | 8080 | http://localhost:8080 |
| Frontend (Vite) | 5173 | http://localhost:5173 |

---

## 🧰 Teknologi yang Digunakan

**Frontend:**
- React 18 + Vite
- Firebase Client SDK (Auth)

**Backend:**
- Java 21 + Spring Boot 3.4
- Spring Security
- Firebase Admin SDK (Firestore + Auth verifikasi token)
- Lombok

**Database & Auth:**
- Firebase Firestore (database cloud)
- Firebase Authentication

---

*Dibuat untuk keperluan Tugas UAS — Semester 4*
