# Mood Detector

Aplikasi deteksi emosi wajah menggunakan AI. Terdiri dari 3 bagian:

```
mood-detector/
├── backend/      → API server (Node.js + Express + MongoDB)
├── frontend/     → Tampilan web (React + TypeScript)
└── ai-service/   → Model AI deteksi emosi (Python + TensorFlow)
```

## Cara Menjalankan (urutan penting)

### Terminal 1 — AI Service
```bash
cd ai-service
pip install -r requirements.txt
# Letakkan skema_D_final.keras di folder ini dulu
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Terminal 2 — Backend
```bash
cd backend
npm install
cp .env.example .env   # ← isi MONGODB_URI dan JWT_SECRET
npm run dev
```

### Terminal 3 — Frontend
```bash
cd frontend
npm install
npm run dev
```

Buka browser → `http://localhost:5173`

## Fitur Utama

- 🔐 Login & Register dengan JWT
- 📷 Deteksi emosi via kamera (limit **5x per hari**, reset jam 00:00)
- 📂 Upload foto untuk dianalisis
- 📊 Dashboard statistik realtime
- 📋 Riwayat mood dengan **hapus massal** (pilih banyak sekaligus)
- 🌙 Dark / Light mode (tersimpan otomatis)
- 📱 Responsive mobile & desktop

## Detail setup ada di README masing-masing folder.