import { EmotionType, EmotionScore, DetectionResult } from '../types';

const ALL_EMOTIONS: EmotionType[] = [
  'Happy', 'Sad', 'Angry', 'Fear', 'Surprise', 'Neutral',
];

/**
 * Menghasilkan skor emosi random yang realistis.
 * Satu emosi akan dominan (60–98%), sisanya dibagi sisa persennya.
 */
function generateRealisticScores(): EmotionScore[] {
  // Pilih emosi dominan secara random (weight lebih ke Happy & Neutral)
  const weights = [0.30, 0.20, 0.10, 0.10, 0.15, 0.15]; // urutan ALL_EMOTIONS
  const rand = Math.random();
  let cumulative = 0;
  let dominantIndex = 0;

  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (rand <= cumulative) {
      dominantIndex = i;
      break;
    }
  }

  // Confidence emosi dominan: 60–98%
  const dominantConfidence = parseFloat(
    (Math.random() * 38 + 60).toFixed(1)
  );

  // Sisa persentase dibagi ke emosi lain secara random
  const remaining = 100 - dominantConfidence;
  const otherEmotions = ALL_EMOTIONS.filter((_, i) => i !== dominantIndex);
  const rawRatios = otherEmotions.map(() => Math.random());
  const totalRatio = rawRatios.reduce((a, b) => a + b, 0);
  const otherScores = rawRatios.map((r, i) => ({
    emotion: otherEmotions[i],
    confidence: parseFloat(((r / totalRatio) * remaining).toFixed(1)),
  }));

  const scores: EmotionScore[] = [
    { emotion: ALL_EMOTIONS[dominantIndex], confidence: dominantConfidence },
    ...otherScores,
  ];

  // Sort descending by confidence
  return scores.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Simulasikan deteksi emosi dengan delay (seperti model AI asli).
 */
export async function mockDetectEmotion(
  _imageBuffer?: Buffer
): Promise<DetectionResult> {
  // Simulasi processing time: 200–600ms
  await new Promise((resolve) =>
    setTimeout(resolve, Math.random() * 400 + 200)
  );

  const allEmotions = generateRealisticScores();
  const dominant = allEmotions[0];

  return {
    dominantEmotion: dominant.emotion,
    dominantConfidence: dominant.confidence,
    allEmotions,
    detectedAt: new Date(),
  };
}