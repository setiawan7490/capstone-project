import { EmotionType, EmotionScore, DetectionResult } from '../types';

const MIRAGE_URL = 'https://xkskhekd-mirage-api.hf.space';

/**
 * Konversi base64 string → Buffer siap kirim sebagai file multipart.
 * Prefix "data:image/jpeg;base64," dihapus jika ada.
 */
function base64ToBuffer(base64: string): { buffer: Buffer; mimeType: string } {
  let mime = 'image/jpeg';
  let data = base64;

  if (base64.includes(',')) {
    const [header, body] = base64.split(',', 2);
    // Ambil mime dari header jika ada, contoh: "data:image/png;base64"
    const mimeMatch = header.match(/data:([^;]+);/);
    if (mimeMatch) mime = mimeMatch[1];
    data = body;
  }

  return { buffer: Buffer.from(data, 'base64'), mimeType: mime };
}

/**
 * Kirim gambar ke MIRAGE API dan kembalikan DetectionResult.
 * Jika gagal, lempar Error — tidak ada fallback mock.
 */
export async function detectEmotion(imageBase64?: string): Promise<DetectionResult> {
  if (!imageBase64) {
    throw new Error('Tidak ada gambar yang dikirim ke AI service.');
  }

  const { buffer, mimeType } = base64ToBuffer(imageBase64);

  // Tentukan ekstensi file dari mime type
  const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';

  // Buat FormData dengan file gambar
  const form = new FormData();
  const blob = new Blob([buffer], { type: mimeType });
  form.append('file', blob, `capture.${ext}`);

  let resp: Response;
  try {
    resp = await fetch(`${MIRAGE_URL}/predict`, {
      method: 'POST',
      headers: { accept: 'application/json' },
      body: form,
      signal: AbortSignal.timeout(15000), // 15 detik timeout
    });
  } catch (err) {
    throw new Error(`Tidak bisa terhubung ke MIRAGE API: ${(err as Error).message}`);
  }

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`MIRAGE API error ${resp.status}: ${text}`);
  }

  // Response MIRAGE:
  // { "emotion": "Happy", "confidence": 0.996, "confidence_pct": "99.60%",
  //   "all_scores": { "Angry": 0, "Fear": 0, "Happy": 0.996, "Sad": 0, "Surprise": 0.004 } }
  const json = await resp.json() as {
    emotion: string;
    confidence: number;
    confidence_pct: string;
    all_scores: Record<string, number>;
  };

  // Ubah all_scores object → array EmotionScore, urutkan descending
  const allEmotions: EmotionScore[] = Object.entries(json.all_scores)
    .map(([emotion, confidence]) => ({
      emotion: emotion as EmotionType,
      confidence: parseFloat((confidence * 100).toFixed(2)), // 0.996 → 99.60
    }))
    .sort((a, b) => b.confidence - a.confidence);

  return {
    dominantEmotion:    json.emotion as EmotionType,
    dominantConfidence: parseFloat((json.confidence * 100).toFixed(2)),
    allEmotions,
    detectedAt:         new Date(),
  };
}