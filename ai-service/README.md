# AI Service — Mood Detector

FastAPI + TensorFlow untuk deteksi emosi dari gambar.

## Cara Menjalankan

```bash
# 1. Letakkan file model di folder ini
#    Nama file: skema_D_final.keras
#    (download dari Google Drive / hasil training Colab)

# 2. Install dependencies Python
pip install -r requirements.txt

# 3. Jalankan server
uvicorn main:app --host 0.0.0.0 --port 8000
```

Cek: `http://localhost:8000/health`
```json
{ "status": "ok", "model_loaded": true }
```

## Jika TensorFlow Error saat Install

```bash
# Mac M1/M2
pip install tensorflow-macos tensorflow-metal

# CPU only (lebih ringan)
pip install tensorflow-cpu
```

## Cara Kerja

1. Backend mengirim gambar dalam format **base64**
2. AI Service mengubah ke grayscale 48×48 piksel
3. Model CNN memprediksi 5 emosi: Angry, Fear, Happy, Sad, Surprise
4. Hasil dikirim kembali ke backend dalam format JSON

## Emosi yang Dideteksi

| Label | Keterangan |
|-------|-----------|
| Happy | Bahagia |
| Sad | Sedih |
| Angry | Marah |
| Fear | Takut |
| Surprise | Terkejut |