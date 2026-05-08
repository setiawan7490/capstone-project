import { Request, Response } from 'express';
import fs from 'fs';
import { detectEmotion } from '../services/emotionService';
import {
  saveMoodEntry, getDashboardStats,
  checkDailyLimit, incrementScanCount,
  DAILY_LIMIT,
} from '../services/historyService';
import { broadcast } from '../config/websocket';

async function enforceLimit(userId: string, res: Response): Promise<boolean> {
  const limit = await checkDailyLimit(userId);
  if (!limit.allowed) {
    const reset = new Date(limit.resetAt).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' });
    res.status(429).json({
      success: false,
      message: `Batas scan harian (${DAILY_LIMIT}x) sudah tercapai. Reset pukul 00:00 malam.`,
      data: { limit: DAILY_LIMIT, used: limit.used, remaining: 0, resetAt: limit.resetAt },
    });
    return false;
  }
  return true;
}

export const detectFromCamera = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    if (!(await enforceLimit(userId, res))) return;

    const { imageBase64 } = req.body;
    const result = await detectEmotion(imageBase64);

    // Tambah hitungan scan SEBELUM simpan — tidak terpengaruh delete
    await incrementScanCount(userId);
    const saved = await saveMoodEntry(result, userId, 'camera');
    const stats = await getDashboardStats(userId);

    broadcast('detection',    { ...result, entryId: saved._id });
    broadcast('stats_update', stats);

    res.json({
      success: true, message: 'Detected',
      data: { detection: result, entryId: saved._id, dailyLimit: stats.dailyLimit },
    });
  } catch (e) {
    res.status(500).json({ success:false, message:'Detection failed', error:(e as Error).message });
  }
};

export const detectFromUpload = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    if (!(await enforceLimit(userId, res))) return;

    if (!req.file) { res.status(400).json({ success:false, message:'No image provided' }); return; }

    const imageBase64 = fs.readFileSync(req.file.path).toString('base64');
    const result      = await detectEmotion(imageBase64);
    const imageUrl    = `/uploads/${req.file.filename}`;

    // Tambah hitungan scan SEBELUM simpan
    await incrementScanCount(userId);
    const saved = await saveMoodEntry(result, userId, 'upload', imageUrl);
    const stats = await getDashboardStats(userId);

    broadcast('detection',    { ...result, entryId: saved._id, imageUrl });
    broadcast('stats_update', stats);

    res.json({
      success: true, message: 'Detected from image',
      data: { detection: result, entryId: saved._id, imageUrl, dailyLimit: stats.dailyLimit },
    });
  } catch (e) {
    res.status(500).json({ success:false, message:'Upload detection failed', error:(e as Error).message });
  }
};