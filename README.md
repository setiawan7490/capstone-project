# 😄 Mood Detector — Panduan Singkat & Mudah

Aplikasi web untuk mendeteksi emosi wajah lewat **kamera** atau **upload gambar**.

---

# 📁 Struktur Folder

```text
mood-detector/
├── backend/      # Server + Database + API
└── frontend/     # Tampilan website React
```

---

# ✅ Yang Harus Sudah Terpasang

Cek di terminal:

```bash
node -v
npm -v
```

Minimal:

* Node.js 18+
* npm terbaru

---

# 🍃 1. Buat Database Gratis (MongoDB Atlas)

1. Buka MongoDB Atlas
2. Buat akun gratis
3. Buat cluster **M0 Free**
4. Buat username + password
5. Pilih IP Access → izinkan semua (`0.0.0.0/0`) untuk gampang
6. Ambil connection string seperti ini:

```text
mongodb+srv://username:password@cluster.mongodb.net/
```

Simpan.

---

# ⚙️ 2. Jalankan Backend

Masuk folder backend:

```bash
cd backend
npm install
```

Buat file `.env`

```env
PORT=5000
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/mood-detector
FRONTEND_URL=http://localhost:5173
```

Lalu jalankan:

```bash
npm run dev
```

Jika berhasil:

```text
MongoDB connected
Server running on port 5000
```

Tes:

```text
http://localhost:5000/api/health
```

---

# 🎨 3. Jalankan Frontend

Buka terminal baru:

```bash
cd frontend
npm install
npm run dev
```

Buka:

```text
http://localhost:5173
```

---

# 🚀 Cara Pakai

## Kamera

* Klik menu **Detection**
* Izinkan kamera
* Sistem mendeteksi otomatis

## Upload Gambar

* Klik menu **Upload**
* Pilih foto
* Klik Analyze

## Dashboard

* Lihat statistik realtime

## History

* Lihat riwayat hasil deteksi

---

# 🌐 API Penting

| Method | URL                    |
| ------ | ---------------------- |
| GET    | `/api/health`          |
| POST   | `/api/detect/camera`   |
| POST   | `/api/detect/upload`   |
| GET    | `/api/history`         |
| GET    | `/api/dashboard/stats` |

---

# 🔌 WebSocket

Realtime update:

```text
ws://localhost:5000/ws
```

---

# ❗ Kalau Error

## MongoDB gagal konek

* cek username/password
* cek URI benar
* cek IP Access di Atlas

## Frontend tidak connect

* backend harus hidup dulu
* port backend 5000

## Kamera tidak jalan

* izinkan browser akses kamera

---

# 📦 Package Penting

## Backend

* express
* mongoose
* ws
* multer
* cors

## Frontend

* react
* react-router-dom
* vite

---

# ✅ Jalankan Cepat

```bash
# terminal 1
cd backend
npm install
npm run dev
```

```bash
# terminal 2
cd frontend
npm install
npm run dev
```

Buka:

```text
http://localhost:5173
```

Selesai 🎉
