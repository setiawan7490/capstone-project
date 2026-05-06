import MoodEntry from '../models/MoodEntry';
import mongoose from 'mongoose';
import { DetectionResult, EmotionType } from '../types';

const ALL_EMOTIONS: EmotionType[] = ['Angry','Fear','Happy','Sad','Surprise','Neutral'];
const DAILY_LIMIT = 50; // max deteksi per user per 24 jam

// ── Rate limit check ──────────────────────────────────────────────
export async function checkDailyLimit(userId: string): Promise<{ allowed: boolean; used: number; remaining: number }> {
  const since = new Date();
  since.setHours(since.getHours() - 24); // 24 jam terakhir (rolling window)

  const used = await MoodEntry.countDocuments({
    userId,
    detectedAt: { $gte: since },
  });

  return {
    allowed:   used < DAILY_LIMIT,
    used,
    remaining: Math.max(0, DAILY_LIMIT - used),
  };
}

// ── Save ──────────────────────────────────────────────────────────
export async function saveMoodEntry(
  result: DetectionResult,
  userId: string,
  source: 'camera' | 'upload',
  imageUrl?: string,
) {
  return MoodEntry.create({
    userId,
    dominantEmotion:    result.dominantEmotion,
    dominantConfidence: result.dominantConfidence,
    allEmotions:        result.allEmotions,
    detectedAt:         result.detectedAt,
    source,
    imageUrl,
  });
}

// ── History list ──────────────────────────────────────────────────
export async function getMoodHistory(
  userId: string,
  params: { page?: number; limit?: number; filter?: string },
) {
  const { page = 1, limit = 10, filter = 'all' } = params;
  const query: Record<string, unknown> = { userId };

  if (filter !== 'all') {
    const now = new Date(), start = new Date();
    if (filter === 'today') start.setHours(0, 0, 0, 0);
    else if (filter === 'week')  start.setDate(now.getDate() - 7);
    else if (filter === 'month') start.setDate(now.getDate() - 30);
    query.detectedAt = { $gte: start, $lte: now };
  }

  const [entries, total] = await Promise.all([
    MoodEntry.find(query).sort({ detectedAt: -1 }).skip((page - 1) * limit).limit(limit),
    MoodEntry.countDocuments(query),
  ]);
  return { entries, total };
}

// ── Single entry ──────────────────────────────────────────────────
export async function getMoodEntryById(id: string, userId: string) {
  return MoodEntry.findOne({ _id: id, userId });
}

// ── Delete satu ───────────────────────────────────────────────────
export async function deleteMoodEntry(id: string, userId: string) {
  return MoodEntry.findOneAndDelete({ _id: id, userId });
}

// ── Bulk delete ───────────────────────────────────────────────────
export async function bulkDeleteMoodEntries(
  userId: string,
  mode: 'all' | 'today' | 'week' | 'month' | 'ids',
  ids?: string[],
): Promise<number> {
  const query: Record<string, unknown> = { userId };

  if (mode === 'ids' && ids?.length) {
    query._id = { $in: ids.map(id => new mongoose.Types.ObjectId(id)) };
  } else if (mode !== 'all') {
    const now = new Date(), start = new Date();
    if (mode === 'today') start.setHours(0, 0, 0, 0);
    else if (mode === 'week')  start.setDate(now.getDate() - 7);
    else if (mode === 'month') start.setDate(now.getDate() - 30);
    query.detectedAt = { $gte: start, $lte: now };
  }

  const result = await MoodEntry.deleteMany(query);
  return result.deletedCount;
}

// ── Dashboard stats ───────────────────────────────────────────────
export async function getDashboardStats(userId: string) {
  const now    = new Date();
  const userObjId = new mongoose.Types.ObjectId(userId);

  const totalDetections = await MoodEntry.countDocuments({ userId });

  const rawCounts = await MoodEntry.aggregate([
    { $match: { userId: userObjId } },
    { $group: { _id: '$dominantEmotion', count: { $sum: 1 } } },
  ]);
  const emotionCounts = ALL_EMOTIONS.reduce(
    (a, e) => ({ ...a, [e]: 0 }),
    {} as Record<EmotionType, number>,
  );
  rawCounts.forEach(r => { emotionCounts[r._id as EmotionType] = r.count; });

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayEntries = await MoodEntry.find({ userId, detectedAt: { $gte: todayStart } });
  let todayDominantMood: EmotionType | null = null;
  let todayDominantPercent = 0;
  if (todayEntries.length > 0) {
    const tc = ALL_EMOTIONS.reduce((a, e) => ({ ...a, [e]: 0 }), {} as Record<EmotionType, number>);
    todayEntries.forEach(e => { tc[e.dominantEmotion]++; });
    const [top] = Object.entries(tc).sort(([, a], [, b]) => b - a);
    todayDominantMood    = top[0] as EmotionType;
    todayDominantPercent = parseFloat(((top[1] / todayEntries.length) * 100).toFixed(1));
  }

  const sevenAgo = new Date(); sevenAgo.setDate(now.getDate() - 7);
  const raw7 = await MoodEntry.aggregate([
    { $match: { userId: userObjId, detectedAt: { $gte: sevenAgo } } },
    { $group: { _id: '$dominantEmotion', count: { $sum: 1 } } },
  ]);
  const last7DaysDistribution = ALL_EMOTIONS.map(e => ({
    emotion: e,
    count:   raw7.find(r => r._id === e)?.count || 0,
  }));

  const trendRaw = await MoodEntry.aggregate([
    { $match: { userId: userObjId, detectedAt: { $gte: sevenAgo } } },
    { $group: {
      _id: {
        date:    { $dateToString: { format: '%Y-%m-%d', date: '$detectedAt' } },
        emotion: '$dominantEmotion',
      },
      count: { $sum: 1 },
    }},
  ]);
  const weeklyTrend = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(); d.setDate(now.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const counts: Partial<Record<EmotionType, number>> = {};
    trendRaw.filter(r => r._id.date === dateStr).forEach(r => {
      counts[r._id.emotion as EmotionType] = r.count;
    });
    return { day: d.toLocaleDateString('en-US', { weekday: 'short' }), date: dateStr, counts };
  });

  // Info rate limit untuk hari ini
  const limitInfo = await checkDailyLimit(userId);

  return {
    totalDetections,
    emotionCounts,
    todayDominantMood,
    todayDominantPercent,
    last7DaysDistribution,
    weeklyTrend,
    dailyLimit: {
      limit:     DAILY_LIMIT,
      used:      limitInfo.used,
      remaining: limitInfo.remaining,
    },
  };
}