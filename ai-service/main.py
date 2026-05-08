import base64
import io
import os
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
import tensorflow as tf

# Label sesuai urutan training kamu:
# EMOTION_MAPPING = {'Angry': 0, 'Fear': 1, 'Happy': 2, 'Sad': 3, 'Suprise': 4}
EMOTION_NAMES = {0: "Angry", 1: "Fear", 2: "Happy", 3: "Sad", 4: "Surprise"}

MODEL_PATH = os.path.join(os.path.dirname(__file__), "skema_D_final.keras")

model = None
try:
    model = tf.keras.models.load_model(MODEL_PATH)
    print(f"✅ Model loaded dari: {MODEL_PATH}")
    print(f"   Input : {model.input_shape}")
    print(f"   Output: {model.output_shape}")
except Exception as e:
    print(f"⚠️  Gagal load model: {e}")
    print(f"   Pastikan skema_D_final.keras ada di folder ai-service/")

app = FastAPI(title="Mood Detector AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    image: str  # base64 string, boleh ada prefix "data:image/jpeg;base64," atau tidak


def preprocess(b64: str) -> np.ndarray:
    # Hapus prefix data URL kalau ada
    if "," in b64:
        b64 = b64.split(",", 1)[1]
    img_bytes = base64.b64decode(b64)
    img = Image.open(io.BytesIO(img_bytes)).convert("L")  # Grayscale
    img = img.resize((48, 48), Image.Resampling.LANCZOS)
    arr = np.array(img, dtype=np.float32) / 255.0
    return arr.reshape(1, 48, 48, 1)


@app.get("/")
def root():
    return {"service": "Mood Detector AI", "model_loaded": model is not None}


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "emotions": list(EMOTION_NAMES.values()),
    }


@app.post("/predict")
def predict(body: PredictRequest):
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model belum di-load. Letakkan skema_D_final.keras di folder ai-service/ lalu restart."
        )
    try:
        x = preprocess(body.image)
        preds = model.predict(x, verbose=0)[0]  # shape: (5,)

        emotions = [
            {"emotion": EMOTION_NAMES[i], "confidence": round(float(preds[i]) * 100, 2)}
            for i in range(len(EMOTION_NAMES))
        ]
        emotions.sort(key=lambda e: e["confidence"], reverse=True)

        return {
            "dominant": emotions[0]["emotion"],
            "confidence": emotions[0]["confidence"],
            "emotions": emotions,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediksi gagal: {str(e)}")