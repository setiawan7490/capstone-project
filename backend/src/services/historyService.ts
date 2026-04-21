import MoodEntry, { IMoodEntryDocument } from '../models/MoodEntry';
import { DetectionResult, DashboardStats, EmotionType } from '../types';

const ALL_EMOTIONS: EmotionType[] = [
  'Happy', 'Sad', 'Angry', 'Fear', 'Surprise', 'Neutral',
];

/** Simpan hasil deteksi ke database */
export async function saveMoodEntry(
  result: DetectionResult,
  source: 'camera' | 'upload',
  imageUrl?: string
): Promise<IMoodEntryDocument> {
  const entry = await MoodEntry.create({
    dominantEmotion: result.dominantEmotion,
    dominantConfidence: result.dominantConfidence,
    allEmotions: result.allEmotions,
    detectedAt: result.detectedAt,
    source,
    imageUrl,
  });
  return entry;
}

/** Ambil semua riwayat dengan filter opsional */
export async function getMoodHistory(params: {
  page?: number;
  limit?: number;
  filter?: 'today' | 'week' | 'month' | 'all';
}): Promise<{ entries: IMoodEntryDocument[]; total: number }> {
  const { page = 1, limit = 20, filter = 'all' } = params;
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = {};

  if (filter !== 'all') {
    const now = new Date();
    const start = new Date();

    if (filter === 'today') {
      start.setHours(0, 0, 0, 0);
    } else if (filter === 'week') {
      start.setDate(now.getDate() - 7);
    } else if (filter === 'month') {
      start.setDate(now.getDate() - 30);
    }

    query.detectedAt = { $gte: start, $lte: now };
  }

  const [entries, total] = await Promise.all([
    MoodEntry.find(query).sort({ detectedAt: -1 }).skip(skip).limit(limit),
    MoodEntry.countDocuments(query),
  ]);

  return { entries, total };
}

/** Ambil satu entry by ID */
export async function getMoodEntryById(
  id: string
): Promise<IMoodEntryDocument | null> {
  return MoodEntry.findById(id);
}

/** Hapus satu entry by ID */
export async function deleteMoodEntry(id: string): Promise<boolean> {
  const result = await MoodEntry.findByIdAndDelete(id);
  return result !== null;
}

/** Ambil statistik untuk dashboard */
export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();

  // Total deteksi
  const totalDetections = await MoodEntry.countDocuments();

  // Hitung per-emosi (all time)
  const emotionCountsRaw = await MoodEntry.aggregate([
    { $group: { _id: '$dominantEmotion', count: { $sum: 1 } } },
  ]);

  const emotionCounts = ALL_EMOTIONS.reduce(
    (acc, e) => ({ ...acc, [e]: 0 }),
    {} as Record<EmotionType, number>
  );
  emotionCountsRaw.forEach((item) => {
    emotionCounts[item._id as EmotionType] = item.count;
  });

  // Today's dominant mood
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEntries = await MoodEntry.find({
    detectedAt: { $gte: todayStart, $lte: now },
  });

  let todayDominantMood: EmotionType | null = null;
  let todayDominantPercent = 0;

  if (todayEntries.length > 0) {
    const todayCounts = ALL_EMOTIONS.reduce(
      (acc, e) => ({ ...acc, [e]: 0 }),
      {} as Record<EmotionType, number>
    );
    todayEntries.forEach((e) => {
      todayCounts[e.dominantEmotion]++;
    });

    const maxEntry = Object.entries(todayCounts).sort(([, a], [, b]) => b - a)[0];
    todayDominantMood = maxEntry[0] as EmotionType;
    todayDominantPercent = parseFloat(
      ((maxEntry[1] / todayEntries.length) * 100).toFixed(1)
    );
  }

  // Last 7 days distribution
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  const last7DaysRaw = await MoodEntry.aggregate([
    { $match: { detectedAt: { $gte: sevenDaysAgo } } },
    { $group: { _id: '$dominantEmotion', count: { $sum: 1 } } },
  ]);

  const last7DaysDistribution = ALL_EMOTIONS.map((emotion) => ({
    emotion,
    count: last7DaysRaw.find((r) => r._id === emotion)?.count || 0,
  }));

  // Weekly trend (per hari, 7 hari terakhir)
  const weeklyTrendRaw = await MoodEntry.aggregate([
    { $match: { detectedAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$detectedAt' } },
          emotion: '$dominantEmotion',
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.date': 1 } },
  ]);

  // Build 7-day array
  const weeklyTrend = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(now.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

    const counts: Partial<Record<EmotionType, number>> = {};
    weeklyTrendRaw
      .filter((r) => r._id.date === dateStr)
      .forEach((r) => {
        counts[r._id.emotion as EmotionType] = r.count;
      });

    return { day: dayName, date: dateStr, counts };
  });

  return {
    totalDetections,
    emotionCounts,
    todayDominantMood,
    todayDominantPercent,
    last7DaysDistribution,
    weeklyTrend,
  };
}