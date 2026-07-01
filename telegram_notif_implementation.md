# 📋 Langkah Implementasi Fitur Notifikasi Telegram

> **Level:** Junior-friendly — fokus pada URUTAN dan KONSEP, bukan detail kode
> **Stack:** Spring Boot (Backend) + React (Frontend)

---

## 🗺️ Gambaran Besar

Fitur ini terdiri dari **3 bagian besar:**

```
[A] PERSIAPAN          → Buat bot Telegram + siapkan email
[B] BACKEND            → Spring Boot terima & kirim data
[C] FRONTEND           → Tampilan untuk admin
```

---

## BAGIAN A — Persiapan (Sekali saja)

### A1. Buat Bot Telegram
1. Buka Telegram → cari **@BotFather**
2. Kirim pesan `/newbot`
3. Ikuti instruksi → masukkan nama bot (misal: `KasKitaBot`)
4. Simpan **TOKEN** yang diberikan BotFather (bentuknya: `1234567:ABCdef...`)
5. Simpan juga **username bot** (misal: `@KasKitaBot`)

### A2. Siapkan Email Pengirim
1. Gunakan akun Gmail khusus untuk aplikasi (misal: `kaskita.notif@gmail.com`)
2. Aktifkan **"App Password"** di pengaturan Google Account
   - Google Account → Security → 2-Step Verification → App Passwords
   - Generate password → simpan hasilnya
3. Password ini yang dipakai Spring Boot untuk kirim email (bukan password Gmail biasa)

### A3. Simpan Konfigurasi
Tambahkan ke file `application.properties` di backend:
```
telegram.bot.token=TOKEN_DARI_BOTFATHER
telegram.bot.username=KasKitaBot

spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=kaskita.notif@gmail.com
spring.mail.password=APP_PASSWORD_DARI_GOOGLE
```
> ⚠️ Jangan commit file ini ke GitHub! Tambahkan ke `.gitignore`

---

## BAGIAN B — Backend (Spring Boot)

> **Urutan pengerjaan penting!** Kerjakan sesuai nomor.

### B1. Tambah Kolom di Database
Tabel `users` perlu 3 kolom baru:

| Kolom Baru | Tipe | Fungsi |
|---|---|---|
| `telegram_chat_id` | VARCHAR | Menyimpan ID chat Telegram siswa |
| `invite_token` | VARCHAR | Token unik untuk verifikasi |
| `telegram_linked` | BOOLEAN | Status apakah sudah hubungkan Telegram |

Cara: buat file migrasi SQL baru atau update entity `User.java`.

---

### B2. Buat `TelegramService`
**Tugasnya:** Kirim pesan teks ke Telegram.

Cara kerjanya sederhana:
- Terima parameter: `chatId` (ID chat tujuan) + `pesan` (teks)
- Kirim HTTP POST ke URL Telegram API
- Telegram yang urus pengiriman ke HP siswa

> 📌 Analoginya seperti kirim SMS — kita cukup tahu nomornya (chatId) dan isi pesannya.

---

### B3. Buat `EmailService`
**Tugasnya:** Kirim email invite ke siswa.

Email berisi:
- Sapaan + penjelasan singkat
- **Link Telegram:** `https://t.me/KasKitaBot?start=TOKEN_UNIK`
- Instruksi singkat untuk siswa

> 📌 Spring Boot sudah punya library email bawaan, tinggal dipanggil.

---

### B4. Update `InviteService` (atau buat baru)
**Tugasnya:** Mengurus alur invite dari awal sampai akhir.

Langkah di dalamnya:
1. Terima request dari admin (nama siswa + email)
2. Generate token acak (pakai `UUID.randomUUID()`)
3. Simpan token ke database bersama data siswa
4. Panggil `EmailService` untuk kirim email
5. Kembalikan response sukses ke admin

---

### B5. Buat `TelegramWebhookController`
**Tugasnya:** Menerima pesan dari bot Telegram ketika siswa klik START.

Cara kerja:
1. Telegram akan otomatis kirim HTTP POST ke endpoint kita setiap ada pesan masuk ke bot
2. Controller ini membaca isi pesan `/start TOKEN`
3. Cari token di database → dapat data siswa
4. Simpan `chat_id` Telegram siswa ke database
5. Ubah status `telegram_linked` menjadi `true`
6. Balas siswa dengan pesan konfirmasi

> 📌 Endpoint ini perlu URL publik untuk bisa diterima Telegram. Saat development, pakai **ngrok**.

---

### B6. Daftarkan Webhook ke Telegram
Setelah endpoint siap, beritahu Telegram alamat endpoint kita:

```
Kirim GET request ke:
https://api.telegram.org/bot{TOKEN}/setWebhook?url=https://DOMAIN_KAMU/api/v1/telegram/webhook
```

Bisa dilakukan via browser atau Postman. Cukup sekali saja.

---

### B7. Buat Endpoint untuk Kirim Reminder
**Tugasnya:** Admin tekan tombol → notifikasi dikirim ke siswa.

Flow:
1. Admin klik tombol "Kirim Reminder" untuk siswa tertentu
2. Frontend kirim request ke backend dengan `userId` siswa
3. Backend cek apakah siswa sudah `telegram_linked`
4. Jika ya → ambil `chat_id` → panggil `TelegramService` → kirim pesan pengingat
5. Jika tidak → kembalikan error "Siswa belum hubungkan Telegram"

---

## BAGIAN C — Frontend (React)

### C1. Update Halaman Admin Kas Siswa
Tambahkan kolom baru di tabel siswa:

```
SEBELUM:
| Nama | Status Bayar | Aksi |

SESUDAH:
| Nama | Status Bayar | Telegram      | Aksi              |
|------|-------------|---------------|-------------------|
| Ahmad| BELUM       | ✅ Terhubung  | [Kirim Reminder]  |
| Budi | LUNAS       | ✅ Terhubung  | -                 |
| Citra| BELUM       | ❌ Belum      | [Kirim Ulang 📧]  |
```

---

### C2. Buat Tombol "Invite Siswa"
- Tombol di atas tabel → buka form popup/modal
- Form berisi: Nama Siswa + Email
- Klik submit → panggil endpoint B4
- Tampilkan notifikasi sukses: "Email invite berhasil dikirim!"

---

### C3. Tombol "Kirim Reminder"
- Hanya muncul jika siswa: status BELUM BAYAR + Telegram sudah terhubung
- Klik → panggil endpoint B7
- Tampilkan loading → lalu sukses/gagal

---

### C4. Tombol "Kirim Ulang Invite"
- Muncul jika siswa belum terhubung Telegram
- Klik → kirim ulang email invite (panggil B4 lagi)

---

## 🧪 Cara Testing (untuk Presentasi)

### Setup awal (cukup sekali):
1. Jalankan backend Spring Boot
2. Jalankan `ngrok http 8080` → copy URL https-nya
3. Daftarkan webhook ke Telegram (langkah B6) pakai URL ngrok
4. Jalankan frontend React

### Demo flow:
```
1. Buka panel admin → halaman Kas Siswa
2. Klik "Invite Siswa" → isi nama + email
3. Buka email siswa → klik link Telegram
4. Di Telegram → klik START
5. Kembali ke panel admin → refresh → status berubah ✅
6. Klik "Kirim Reminder" → cek HP → notif masuk!
```

---

## 📦 Ringkasan File yang Dibuat/Diubah

### Backend (baru):
- `TelegramService.java`
- `EmailService.java`
- `TelegramWebhookController.java`
- Migration SQL (tambah kolom di tabel users)

### Backend (diubah):
- `User.java` → tambah field baru
- `UserController.java` atau `NotificationController.java` → tambah endpoint invite & reminder
- `application.properties` → tambah konfigurasi

### Frontend (diubah):
- `AdminKasSiswaPage.jsx` → tambah kolom Telegram + tombol-tombol baru

---

## ⏱️ Estimasi Waktu Pengerjaan

| Bagian | Estimasi |
|---|---|
| A — Persiapan | 30 menit |
| B1-B3 — DB + Service | 1-2 jam |
| B4-B7 — Controller & Endpoint | 2-3 jam |
| C — Frontend | 1-2 jam |
| Testing & Debug | 1 jam |
| **Total** | **~6-8 jam** |
