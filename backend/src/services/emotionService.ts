import { EmotionType, EmotionScore, DetectionResult } from '../types';

const ALL: EmotionType[] = ['Angry', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral'];

function mockScores(): EmotionScore[] {
  const weights = [0.12, 0.12, 0.35, 0.18, 0.13, 0.10];
  const r = Math.random();
  let cum = 0, di = 0;
  for (let i = 0; i < weights.length; i++) {
    cum += weights[i];
    if (r <= cum) { di = i; break; }
  }
  const dom = parseFloat((Math.random() * 30 + 60).toFixed(1));
  const rest = ALL.filter((_, i) => i !== di).map(e => ({ emotion: e, confidence: 0 }));
  const rem = 100 - dom;
  const ratios = rest.map(() => Math.random());
  const total = ratios.reduce((a, b) => a + b, 0);
  rest.forEach((r, i) => { r.confidence = parseFloat(((ratios[i] / total) * rem).toFixed(1)); });
  return [{ emotion: ALL[di], confidence: dom }, ...rest].sort((a, b) => b.confidence - a.confidence);
}

export async function detectEmotion(imageBase64?: string): Promise<DetectionResult> {
  const aiUrl = process.env.AI_SERVICE_URL;

  // Coba panggil AI Python service jika tersedia
  if (aiUrl && imageBase64) {
    try {
      const resp = await fetch(`${aiUrl}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageBase64 }),
        signal: AbortSignal.timeout(8000),
      });
      if (resp.ok) {
        const json = await resp.json() as { emotions: EmotionScore[] };
        const sorted = json.emotions.sort((a, b) => b.confidence - a.confidence);
        return {
          dominantEmotion:    sorted[0].emotion,
          dominantConfidence: sorted[0].confidence,
          allEmotions:        sorted,
          detectedAt:         new Date(),
        };
      }
    } catch {
      console.log('[AI] Service tidak tersedia, pakai mock');
    }
  }

  // Fallback: mock
  await new Promise(r => setTimeout(r, 300 + Math.random() * 400));
  const scores = mockScores();
  return {
    dominantEmotion:    scores[0].emotion,
    dominantConfidence: scores[0].confidence,
    allEmotions:        scores,
    detectedAt:         new Date(),
  };
}