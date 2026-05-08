# Backend — Mood Detector

Express + TypeScript + MongoDB

## Cara Menjalankan

```bash
# 1. Install dependencies
npm install

# 2. Buat file .env
cp .env.example .env
```

Buka `.env` dan isi:
```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/mood-detector?retryWrites=true&w=majority
JWT_SECRET=isi_string_acak_panjang_minimal_32_karakter
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
AI_SERVICE_URL=http://localhost:8000
```

```bash
# 3. Jalankan development server
npm run dev
```

Cek: `http://localhost:5000/api/health` → harus return `{ success: true }`

## Setup MongoDB Atlas (gratis)

1. Buka https://cloud.mongodb.com → daftar
2. Create cluster → pilih **M0 Free**
3. Database Access → Add User → buat username + password
4. Network Access → Add IP Address → `0.0.0.0/0` (allow all)
5. Connect → Drivers → salin connection string → paste ke `MONGODB_URI`

## Endpoint Utama

| Method | URL | Auth | Keterangan |
|--------|-----|------|------------|
| POST | `/api/auth/register` | - | Daftar |
| POST | `/api/auth/login` | - | Login |
| POST | `/api/detect/camera` | ✅ | Deteksi dari kamera |
| POST | `/api/detect/upload` | ✅ | Deteksi dari foto |
| GET | `/api/history` | ✅ | Riwayat mood |
| DELETE | `/api/history/bulk` | ✅ | Hapus massal |
| GET | `/api/dashboard/stats` | ✅ | Statistik |

Limit: **5x deteksi per user per hari**, reset jam 00:00.