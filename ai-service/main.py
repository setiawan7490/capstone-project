import base64
import io
import os
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image

# ── Load Model ────────────────────────────────────────────────────
import tensorflow as tf

# Nama file model — sesuaikan jika berbeda
MODEL_PATH = os.path.join(os.path.dirname(__file__), "skema_D_final.keras")

# Label emosi sesuai urutan training kamu
# Kode training: {'Angry': 0, 'Fear': 1, 'Happy': 2, 'Sad': 3, 'Suprise': 4}
EMOTION_NAMES = {
    0: "Angry",
    1: "Fear",
    2: "Happy",
    3: "Sad",
    4: "Surprise"   # nama tampil pakai ejaan baku
}

model = None

def load_model():
    global model
    if not os.path.exists(MODEL_PATH):
        print(f"⚠️  Model tidak ditemukan di: {MODEL_PATH}")
        print("    Letakkan file skema_D_final.keras di folder yang sama dengan main.py")
        return
    try:
        model = tf.keras.models.load_model(MODEL_PATH)
        print(f"✅ Model berhasil dimuat: {MODEL_PATH}")
        print(f"   Input shape  : {model.input_shape}")
        print(f"   Output shape : {model.output_shape}")
    except Exception as e:
        print(f"❌ Gagal load model: {e}")

load_model()

# ── FastAPI App ───────────────────────────────────────────────────
app = FastAPI(
    title="Mood Detector AI Service",
    description="Deteksi emosi wajah menggunakan CNN model",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    image: str  # base64 encoded image (JPEG/PNG)


def preprocess_image(b64_string: str) -> np.ndarray:
    """
    Decode base64 image → grayscale 48x48 → normalize → reshape ke (1, 48, 48, 1)
    Sesuai preprocessing yang dipakai saat training.
    """
    # Hapus prefix data URL kalau ada (misal: "data:image/jpeg;base64,...")
    if "," in b64_string:
        b64_string = b64_string.split(",", 1)[1]

    img_bytes = base64.b64decode(b64_string)
    img = Image.open(io.BytesIO(img_bytes)).convert("L")  # Grayscale
    img = img.resize((48, 48), Image.Resampling.LANCZOS)
    arr = np.array(img, dtype=np.float32) / 255.0          # Normalize 0-1
    return arr.reshape(1, 48, 48, 1)


@app.get("/")
def root():
    return {
        "service": "Mood Detector AI Service",
        "status": "running",
        "model_loaded": model is not None,
        "emotions": list(EMOTION_NAMES.values())
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "model_path": MODEL_PATH,
        "emotions": list(EMOTION_NAMES.values())
    }


@app.post("/predict")
def predict(body: PredictRequest):
    if model is None:
        raise HTTPException(
            status_code=503,
            detail=(
                "Model belum di-load. "
                "Letakkan file skema_D_final.keras di folder yang sama dengan main.py, "
                "lalu restart server."
            )
        )

    try:
        # Preprocessing
        x = preprocess_image(body.image)

        # Prediksi
        preds = model.predict(x, verbose=0)[0]  # shape: (5,)

        # Format hasil
        emotions = [
            {
                "emotion": EMOTION_NAMES[i],
                "confidence": round(float(preds[i]) * 100, 2)
            }
            for i in range(len(EMOTION_NAMES))
        ]

        # Sort descending by confidence
        emotions.sort(key=lambda e: e["confidence"], reverse=True)

        return {
            "dominant": emotions[0]["emotion"],
            "confidence": emotions[0]["confidence"],
            "emotions": emotions
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Format gambar tidak valid: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediksi gagal: {e}")