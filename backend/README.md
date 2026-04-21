# Mood Detector — Backend API

Backend Express + TypeScript + MongoDB untuk aplikasi Mood Detector.

---

## 🚀 Setup & Menjalankan

```bash
cd backend
npm install

# Salin dan isi .env
cp .env.example .env

# Jalankan dev server
npm run dev
```

Pastikan MongoDB sudah berjalan di lokal, atau isi `MONGODB_URI` dengan URI MongoDB Atlas.

---

## 📋 API Endpoints

### Base URL: `http://localhost:5000`

---

### ✅ Health Check

```
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "message": "Mood Detector API is running 🚀",
  "timestamp": "2025-04-20T10:00:00.000Z",
  "version": "1.0.0"
}
```

---

### 🎭 Detection

#### `POST /api/detect/camera`
Deteksi emosi dari webcam (mock). Tidak perlu body.

**Response:**
```json
{
  "success": true,
  "message": "Emotion detected successfully",
  "data": {
    "detection": {
      "dominantEmotion": "Happy",
      "dominantConfidence": 87.4,
      "allEmotions": [
        { "emotion": "Happy",   "confidence": 87.4 },
        { "emotion": "Neutral", "confidence": 6.2  },
        { "emotion": "Surprise","confidence": 3.1  },
        { "emotion": "Sad",     "confidence": 1.8  },
        { "emotion": "Fear",    "confidence": 0.9  },
        { "emotion": "Angry",   "confidence": 0.6  }
      ],
      "detectedAt": "2025-04-20T10:00:00.000Z"
    },
    "entryId": "661f2a3b4c5d6e7f8a9b0c1d"
  }
}
```

---

#### `POST /api/detect/upload`
Deteksi emosi dari gambar yang diupload.

**Request:** `multipart/form-data`
| Field | Type | Required | Keterangan |
|-------|------|----------|------------|
| image | File | ✅ | JPG, PNG, WEBP — maks 5MB |

**Response:**
```json
{
  "success": true,
  "message": "Emotion detected from uploaded image",
  "data": {
    "detection": { ... },
    "entryId": "661f2a3b...",
    "imageUrl": "/uploads/1713600000000-123456789.jpg"
  }
}
```

---

### 📜 History

#### `GET /api/history`
Ambil riwayat deteksi dengan pagination dan filter.

**Query Params:**
| Param  | Default | Nilai |
|--------|---------|-------|
| page   | 1       | number |
| limit  | 20      | number |
| filter | all     | `today` \| `week` \| `month` \| `all` |

**Contoh:**
```
GET /api/history?filter=today&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "message": "History retrieved successfully",
  "data": {
    "entries": [
      {
        "_id": "661f2a3b4c5d6e7f8a9b0c1d",
        "dominantEmotion": "Happy",
        "dominantConfidence": 87.4,
        "allEmotions": [ ... ],
        "detectedAt": "2025-04-20T10:32:00.000Z",
        "source": "camera",
        "imageUrl": null,
        "createdAt": "2025-04-20T10:32:01.000Z",
        "updatedAt": "2025-04-20T10:32:01.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 42,
      "totalPages": 3
    }
  }
}
```

---

#### `GET /api/history/:id`
Ambil satu entry berdasarkan ID.

**Response:**
```json
{
  "success": true,
  "message": "Entry retrieved successfully",
  "data": { ... }
}
```

---

#### `DELETE /api/history/:id`
Hapus satu entry.

**Response:**
```json
{
  "success": true,
  "message": "Mood entry deleted successfully"
}
```

---

### 📊 Dashboard

#### `GET /api/dashboard/stats`
Ambil semua statistik untuk halaman dashboard.

**Response:**
```json
{
  "success": true,
  "message": "Dashboard stats retrieved successfully",
  "data": {
    "totalDetections": 305,
    "emotionCounts": {
      "Happy": 185,
      "Sad": 72,
      "Angry": 28,
      "Fear": 12,
      "Surprise": 5,
      "Neutral": 3
    },
    "todayDominantMood": "Happy",
    "todayDominantPercent": 62.0,
    "last7DaysDistribution": [
      { "emotion": "Happy",   "count": 45 },
      { "emotion": "Sad",     "count": 20 },
      { "emotion": "Angry",   "count": 8  },
      { "emotion": "Fear",    "count": 5  },
      { "emotion": "Surprise","count": 3  },
      { "emotion": "Neutral", "count": 2  }
    ],
    "weeklyTrend": [
      {
        "day": "Mon",
        "date": "2025-04-14",
        "counts": { "Happy": 8, "Sad": 3, "Angry": 1 }
      },
      ...
    ]
  }
}
```

---

## 📁 Struktur File

```
backend/
├── src/
│   ├── config/
│   │   ├── db.ts           ← Koneksi MongoDB
│   │   └── multer.ts       ← Config upload file
│   ├── controllers/
│   │   ├── detectionController.ts
│   │   ├── historyController.ts
│   │   └── dashboardController.ts
│   ├── middleware/
│   │   └── errorHandler.ts
│   ├── models/
│   │   └── MoodEntry.ts    ← Mongoose schema
│   ├── routes/
│   │   ├── detection.ts
│   │   ├── history.ts
│   │   └── dashboard.ts
│   ├── services/
│   │   ├── emotionService.ts  ← Mock emotion detection
│   │   └── historyService.ts  ← Business logic + DB queries
│   ├── types/
│   │   └── index.ts
│   ├── app.ts              ← Express app
│   └── index.ts            ← Entry point
├── uploads/                ← Gambar yang diupload (auto-created)
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 🔄 Mengganti Mock dengan Model AI Nyata

Ketika sudah punya model AI, edit file `src/services/emotionService.ts`:

```ts
// Ganti fungsi ini dengan panggilan ke model kamu
export async function mockDetectEmotion(imageBuffer?: Buffer): Promise<DetectionResult> {
  // Contoh: kirim imageBuffer ke Python microservice
  const response = await fetch('http://localhost:8000/predict', {
    method: 'POST',
    body: imageBuffer,
  });
  return response.json();
}
```

Semua bagian lain (controller, routes, model DB) tidak perlu diubah.