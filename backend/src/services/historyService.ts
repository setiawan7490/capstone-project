import MoodEntry from '../models/MoodEntry';
import User from '../models/User';
import mongoose from 'mongoose';
import { DetectionResult, EmotionType } from '../types';

const ALL_EMOTIONS: EmotionType[] = ['Angry','Fear','Happy','Sad','Surprise','Neutral'];
export const DAILY_LIMIT = 5;

/** Format tanggal lokal YYYY-MM-DD */
function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

/** Waktu reset berikutnya = tengah malam hari ini */
function nextMidnight(): string {
  const d = new Date();
  d.setHours(24, 0, 0, 0); // jam 00:00 hari berikutnya
  return d.toISOString();
}

/**
 * Cek sisa kuota scan hari ini.
 * Baca dari User.dailyScanCount — TIDAK terpengaruh delete history.
 */
export async function checkDailyLimit(userId: string): Promise<{
  allowed: boolean; used: number; remaining: number; resetAt: string;
}> {
  const user = await User.findById(userId).select('dailyScanDate dailyScanCount');
  if (!user) return { allowed: false, used: 0, remaining: 0, resetAt: nextMidnight() };

  const today = todayStr();

  // Kalau hari beda → reset otomatis (sudah lewat tengah malam)
  const used = user.dailyScanDate === today ? user.dailyScanCount : 0;
  const remaining = Math.max(0, DAILY_LIMIT - used);

  return { allowed: used < DAILY_LIMIT, used, remaining, resetAt: nextMidnight() };
}

/**
 * Tambah 1 hitungan scan ke User.
 * Dipanggil setelah deteksi berhasil, SEBELUM simpan MoodEntry.
 */
export async function incrementScanCount(userId: string): Promise<void> {
  const today = todayStr();
  const user  = await User.findById(userId).select('dailyScanDate dailyScanCount');
  if (!user) return;

  if (user.dailyScanDate === today) {
    // Hari sama → tambah counter
    await User.findByIdAndUpdate(userId, { $inc: { dailyScanCount: 1 } });
  } else {
    // Hari beda → reset ke 1
    await User.findByIdAndUpdate(userId, {
      dailyScanDate:  today,
      dailyScanCount: 1,
    });
  }
}

export async function saveMoodEntry(
  result: DetectionResult,
  userId: string,
  source: 'camera' | 'upload',
  imageUrl?: string,
  imageGridFsId?: string,
) {
  return MoodEntry.create({
    userId,
    dominantEmotion:    result.dominantEmotion,
    dominantConfidence: result.dominantConfidence,
    allEmotions:        result.allEmotions,
    detectedAt:         result.detectedAt,
    source,
    imageUrl,
    imageGridFsId,
  });
}

export async function getMoodHistory(userId: string, params: { page?:number; limit?:number; filter?:string }) {
  const { page=1, limit=10, filter='all' } = params;
  const query: Record<string,unknown> = { userId };
  if (filter !== 'all') {
    const now=new Date(), start=new Date();
    if (filter==='today')      start.setHours(0,0,0,0);
    else if (filter==='week')  start.setDate(now.getDate()-7);
    else if (filter==='month') start.setDate(now.getDate()-30);
    query.detectedAt = { $gte:start, $lte:now };
  }
  const [entries, total] = await Promise.all([
    MoodEntry.find(query).sort({ detectedAt:-1 }).skip((page-1)*limit).limit(limit),
    MoodEntry.countDocuments(query),
  ]);
  return { entries, total };
}

export async function getMoodEntryById(id: string, userId: string) {
  return MoodEntry.findOne({ _id:id, userId });
}

export async function deleteMoodEntry(id: string, userId: string) {
  // Hapus history TIDAK mengubah dailyScanCount
  return MoodEntry.findOneAndDelete({ _id:id, userId });
}

/**
 * Ambil semua imageGridFsId yang akan terdampak bulk delete.
 * Dipanggil SEBELUM menghapus dokumen dari collection MoodEntry,
 * agar kita bisa hapus file dari GridFS setelahnya.
 */
export async function getBulkMoodEntryGridFsIds(
  userId: string,
  mode: 'all' | 'today' | 'week' | 'month' | 'ids',
  ids?: string[],
): Promise<string[]> {
  const query: Record<string, unknown> = { userId, imageGridFsId: { $ne: null } };
  if (mode === 'ids' && ids?.length) {
    query._id = { $in: ids };
  } else if (mode !== 'all') {
    const now = new Date(), start = new Date();
    if (mode === 'today')      start.setHours(0, 0, 0, 0);
    else if (mode === 'week')  start.setDate(now.getDate() - 7);
    else if (mode === 'month') start.setDate(now.getDate() - 30);
    query.detectedAt = { $gte: start, $lte: now };
  }
  const entries = await MoodEntry.find(query).select('imageGridFsId');
  return entries
    .map(e => e.imageGridFsId)
    .filter((id): id is string => typeof id === 'string' && id.length > 0);
}

export async function bulkDeleteMoodEntries(
  userId: string,
  mode: 'all'|'today'|'week'|'month'|'ids',
  ids?: string[],
): Promise<number> {
  // Hapus massal TIDAK mengubah dailyScanCount
  const query: Record<string,unknown> = { userId };
  if (mode === 'ids' && ids?.length) {
    query._id = { $in: ids };
  } else if (mode !== 'all') {
    const now=new Date(), start=new Date();
    if (mode==='today')      start.setHours(0,0,0,0);
    else if (mode==='week')  start.setDate(now.getDate()-7);
    else if (mode==='month') start.setDate(now.getDate()-30);
    query.detectedAt = { $gte:start, $lte:now };
  }
  const res = await MoodEntry.deleteMany(query);
  return res.deletedCount;
}

export async function getDashboardStats(userId: string) {
  const now = new Date();
  const userObjId = new mongoose.Types.ObjectId(userId);

  const totalDetections = await MoodEntry.countDocuments({ userId });

  const rawCounts = await MoodEntry.aggregate([
    { $match: { userId: userObjId } },
    { $group: { _id:'$dominantEmotion', count:{ $sum:1 } } },
  ]);
  const emotionCounts = ALL_EMOTIONS.reduce(
    (a,e) => ({...a,[e]:0}), {} as Record<EmotionType,number>
  );
  rawCounts.forEach(r => { emotionCounts[r._id as EmotionType] = r.count; });

  const todayStart=new Date(); todayStart.setHours(0,0,0,0);
  const todayEntries = await MoodEntry.find({ userId, detectedAt:{ $gte:todayStart } });
  let todayDominantMood: EmotionType|null=null, todayDominantPercent=0;
  if (todayEntries.length > 0) {
    const tc = ALL_EMOTIONS.reduce((a,e)=>({...a,[e]:0}), {} as Record<EmotionType,number>);
    todayEntries.forEach(e => { tc[e.dominantEmotion]++; });
    const [top] = Object.entries(tc).sort(([,a],[,b]) => b-a);
    todayDominantMood    = top[0] as EmotionType;
    todayDominantPercent = parseFloat(((top[1]/todayEntries.length)*100).toFixed(1));
  }

  const sevenAgo=new Date(); sevenAgo.setDate(now.getDate()-7);
  const raw7 = await MoodEntry.aggregate([
    { $match: { userId:userObjId, detectedAt:{ $gte:sevenAgo } } },
    { $group: { _id:'$dominantEmotion', count:{ $sum:1 } } },
  ]);
  const last7DaysDistribution = ALL_EMOTIONS.map(e => ({
    emotion: e,
    count:   raw7.find(r => r._id===e)?.count || 0,
  }));

  const trendRaw = await MoodEntry.aggregate([
    { $match: { userId:userObjId, detectedAt:{ $gte:sevenAgo } } },
    { $group: {
      _id: {
        date:    { $dateToString:{ format:'%Y-%m-%d', date:'$detectedAt' } },
        emotion: '$dominantEmotion',
      },
      count: { $sum:1 },
    }},
  ]);
  const weeklyTrend = Array.from({ length:7 }).map((_,i) => {
    const d=new Date(); d.setDate(now.getDate()-(6-i));
    const dateStr=d.toISOString().split('T')[0];
    const counts: Partial<Record<EmotionType,number>> = {};
    trendRaw.filter(r => r._id.date===dateStr).forEach(r => {
      counts[r._id.emotion as EmotionType] = r.count;
    });
    return { day:d.toLocaleDateString('en-US',{ weekday:'short' }), date:dateStr, counts };
  });

  const limitInfo = await checkDailyLimit(userId);
  return {
    totalDetections, emotionCounts, todayDominantMood, todayDominantPercent,
    last7DaysDistribution, weeklyTrend,
    dailyLimit: {
      limit:     DAILY_LIMIT,
      used:      limitInfo.used,
      remaining: limitInfo.remaining,
      resetAt:   limitInfo.resetAt,
    },
  };
}