# 😄 Mood Detector — Panduan Lengkap

## 📁 Struktur Folder

```
mood-detector/
├── README.md
│
├── backend/                          ← Node.js + Express + MongoDB
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts                 ← Koneksi MongoDB Atlas
│   │   │   ├── multer.ts             ← Config upload file
│   │   │   └── websocket.ts          ← WebSocket realtime
│   │   ├── controllers/
│   │   │   ├── authController.ts     ← Register & Login
│   │   │   ├── detectionController.ts
│   │   │   ├── historyController.ts
│   │   │   └── dashboardController.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts               ← JWT middleware (protect routes)
│   │   │   └── errorHandler.ts
│   │   ├── models/
│   │   │   ├── User.ts               ← Schema user (email, password bcrypt)
│   │   │   └── MoodEntry.ts          ← Schema mood history
│   │   ├── routes/
│   │   │   ├── auth.ts               ← POST /register, POST /login, GET /me
│   │   │   ├── detection.ts          ← POST /detect/camera, POST /detect/upload
│   │   │   ├── history.ts            ← GET/DELETE /history
│   │   │   └── dashboard.ts          ← GET /dashboard/stats
│   │   ├── services/
│   │   │   ├── emotionService.ts     ← Panggil AI service Python
│   │   │   └── historyService.ts     ← Query MongoDB
│   │   ├── types/index.ts
│   │   ├── app.ts
│   │   └── index.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── ai-service/                       ← Python FastAPI + TensorFlow
│   ├── main.py                       ← API endpoint /predict
│   ├── requirements.txt
│   └── skema_D_final.keras           ← ⚠️ LETAKKAN FILE MODEL DI SINI
│
└── frontend/                         ← React + TypeScript + Vite
    ├── src/
    │   ├── api/index.ts              ← Semua fetch ke backend
    │   ├── components/               ← Navbar, StatCard, dll
    │   ├── context/ThemeContext.tsx  ← Dark/Light mode
    │   ├── hooks/useWebSocket.ts     ← Realtime
    │   ├── pages/                    ← Home, Detection, Upload, dll
    │   └── utils/emotionMeta.ts
    ├── package.json
    └── vite.config.ts
```

---

## ✅ Prasyarat

| Software  | Versi  | Cek dengan    |
|-----------|--------|---------------|
| Node.js   | 18+    | `node -v`     |
| Python    | 3.10+  | `python -v`   |
| npm       | 9+     | `npm -v`      |

MongoDB **tidak perlu diinstall** — pakai MongoDB Atlas (gratis online).

---

## 🍃 LANGKAH 1 — Setup MongoDB Atlas (Database Online Gratis)

1. Buka **https://cloud.mongodb.com** → daftar akun gratis
2. Klik **"Create a deployment"** → pilih **M0 Free** → klik **Create**
3. Di layar **Security Quickstart**:
   - Buat username dan password → klik **Create User**
4. **Network Access** → Add IP Address → ketik `0.0.0.0/0` → **Add Entry**
5. **Database** → **Connect** → **Drivers** → salin connection string:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/
   ```
6. Tambahkan `/mood-detector` sebelum `?`:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mood-detector?retryWrites=true&w=majority
   ```

---

## 🐍 LANGKAH 2 — Setup AI Service (Python)

```bash
# 1. Masuk folder ai-service
cd ai-service

# 2. Salin file model dari Google Drive / Colab ke folder ini
#    File: skema_D_final.keras

# 3. Install dependencies
pip install -r requirements.txt

# 4. Jalankan AI service
uvicorn main:app --host 0.0.0.0 --port 8000
```

Cek di browser: **http://localhost:8000/health**
```json
{ "status": "ok", "model_loaded": true }
```

> **Catatan TensorFlow version:**
> Jika error saat install tensorflow, coba:
> - Mac M1/M2: `pip install tensorflow-macos tensorflow-metal`
> - Lainnya: `pip install tensorflow-cpu` (lebih ringan, tanpa GPU)

---

## ⚙️ LANGKAH 3 — Setup Backend

```bash
# 1. Masuk folder backend
cd backend

# 2. Install dependencies
npm install

# 3. Buat file .env dari contoh
cp .env.example .env
```

Buka file `.env` dan isi:

```env
PORT=5000
NODE_ENV=development

# Dari langkah MongoDB Atlas di atas
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/mood-detector?retryWrites=true&w=majority

# Generate dengan: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=isi_string_rahasia_panjang_minimal_32_karakter

JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5173

# URL AI Service Python (pastikan AI service sudah berjalan)
AI_SERVICE_URL=http://localhost:8000
```

```bash
# 4. Jalankan backend
npm run dev
```

Cek di browser: **http://localhost:5000/api/health**
```json
{ "success": true, "message": "Mood Detector API v2 running" }
```

---

## 🎨 LANGKAH 4 — Setup Frontend

Buka **terminal baru** (jangan tutup terminal backend & AI service):

```bash
# 1. Masuk folder frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Jalankan frontend
npm run dev
```

Buka browser → **http://localhost:5173** 🎉

---

## 🧪 CARA TESTING

### Test 1 — Cek semua service berjalan

Buka 3 URL ini di browser:
- ✅ http://localhost:8000/health → AI Service
- ✅ http://localhost:5000/api/health → Backend
- ✅ http://localhost:5173 → Frontend

### Test 2 — Register akun baru

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"123456"}'
```

Expected: `{ "success": true, "data": { "token": "...", "user": {...} } }`

### Test 3 — Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

Salin token dari response, pakai untuk test selanjutnya.

### Test 4 — Deteksi emosi (perlu token)

```bash
curl -X POST http://localhost:5000/api/detect/camera \
  -H "Authorization: Bearer TOKEN_DARI_LOGIN_DI_SINI"
```

Expected: `{ "success": true, "data": { "detection": { "dominantEmotion": "Happy", ... } } }`

### Test 5 — Cek AI service langsung

```bash
# Buat gambar test base64 (contoh sederhana)
python3 -c "
import base64
from PIL import Image
import io
img = Image.new('L', (48,48), color=128)
buf = io.BytesIO()
img.save(buf, format='JPEG')
b64 = base64.b64encode(buf.getvalue()).decode()
print(b64[:50] + '...')
" 

# Kirim ke AI service
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"image":"BASE64_STRING_DARI_ATAS"}'
```

### Test 6 — Via Frontend (paling mudah)

1. Buka http://localhost:5173
2. Klik **Register** → daftar akun baru
3. Login → coba halaman **Detection** (kamera) atau **Upload**
4. Lihat hasil emosi muncul dari model AI kamu

---

## ❓ Troubleshooting

### "Model tidak ditemukan"
```
⚠️ Model tidak ditemukan di: /path/ai-service/skema_D_final.keras
```
→ Salin file `skema_D_final.keras` dari Google Drive ke folder `ai-service/`

### "tensorflow not found" saat pip install
```bash
# Coba versi yang lebih ringan
pip install tensorflow-cpu

# Atau untuk Mac M1/M2
pip install tensorflow-macos
```

### "MongoDB connection error"
- Pastikan connection string di `.env` benar
- Pastikan Network Access di Atlas mengizinkan IP kamu (set `0.0.0.0/0`)
- Cek username/password tidak ada karakter spesial (encode URL jika ada)

### Kamera tidak bisa diakses
- Browser perlu izin akses kamera — cek notifikasi di address bar
- Gunakan Chrome/Firefox terbaru
- Pastikan tidak ada aplikasi lain yang sedang pakai kamera

### Port sudah dipakai
```bash
# Ganti PORT di backend/.env
PORT=5001

# Update proxy di frontend/vite.config.ts
target: 'http://localhost:5001'
```

### Frontend tidak terhubung ke backend
- Pastikan backend berjalan di port 5000
- Cek `vite.config.ts` sudah ada proxy ke `http://localhost:5000`
- Refresh browser

---

## 🌐 Deploy ke Online (Vercel + Railway)

### Backend → Railway (gratis)
1. Buka https://railway.app → login dengan GitHub
2. **New Project** → **Deploy from GitHub repo** → pilih repo backend
3. Add variable dari file `.env` (tanpa tanda kutip)
4. Railway otomatis deploy — salin URL yang diberikan

### AI Service → Railway juga
1. Deploy folder `ai-service/` ke Railway terpisah
2. Pastikan file model `.keras` ikut ter-commit ke repo
   - Atau upload ke Hugging Face Hub dan load dari URL

### Frontend → Vercel (gratis)
1. Buka https://vercel.com → login dengan GitHub
2. **New Project** → import repo frontend
3. Build command: `npm run build`
4. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```
5. Update `vite.config.ts` → ganti proxy dengan URL Railway

---

## 🔌 Ringkasan Endpoint API

| Method | URL | Auth | Fungsi |
|--------|-----|------|--------|
| GET | `/api/health` | - | Cek server |
| POST | `/api/auth/register` | - | Daftar akun |
| POST | `/api/auth/login` | - | Login |
| GET | `/api/auth/me` | ✅ | Data user login |
| POST | `/api/detect/camera` | ✅ | Deteksi dari webcam |
| POST | `/api/detect/upload` | ✅ | Deteksi dari gambar |
| GET | `/api/history` | ✅ | Riwayat mood |
| GET | `/api/history/:id` | ✅ | Detail satu entri |
| DELETE | `/api/history/:id` | ✅ | Hapus entri |
| GET | `/api/dashboard/stats` | ✅ | Statistik dashboard |
| WS | `ws://localhost:5000/ws` | - | Realtime events |

**AI Service:**

| Method | URL | Fungsi |
|--------|-----|--------|
| GET | `/health` | Cek model loaded |
| POST | `/predict` | Prediksi emosi dari base64 image |