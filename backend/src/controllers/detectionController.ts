import { Request, Response } from 'express';
import path from 'path';
import { detectEmotion } from '../services/emotionService';
import { uploadToGridFS } from '../config/gridfs';
import {
  saveMoodEntry, getDashboardStats,
  checkDailyLimit, incrementScanCount,
  DAILY_LIMIT,
} from '../services/historyService';
import { broadcast } from '../config/websocket';

async function enforceLimit(userId: string, res: Response): Promise<boolean> {
  const limit = await checkDailyLimit(userId);
  if (!limit.allowed) {
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

    // Simpan frame kamera ke GridFS (sama seperti upload)
    let imageUrl: string | undefined;
    let gridFsId: string | undefined;

    if (imageBase64) {
      const buffer = Buffer.from(imageBase64, 'base64');
      const filename = `camera-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
      gridFsId = await uploadToGridFS(buffer, filename, 'image/jpeg');
      imageUrl = `/api/images/${gridFsId}`;
    }

    await incrementScanCount(userId);
    const saved = await saveMoodEntry(result, userId, 'camera', imageUrl, gridFsId);
    const stats = await getDashboardStats(userId);

    broadcast('detection',    { ...result, entryId: saved._id, imageUrl });
    broadcast('stats_update', stats);

    res.json({
      success: true, message: 'Detected',
      data: { detection: result, entryId: saved._id, imageUrl, dailyLimit: stats.dailyLimit },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Detection failed', error: (e as Error).message });
  }
};

export const detectFromUpload = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    if (!(await enforceLimit(userId, res))) return;

    if (!req.file) {
      res.status(400).json({ success: false, message: 'No image provided' });
      return;
    }

    const imageBase64 = req.file.buffer.toString('base64');
    const result = await detectEmotion(imageBase64);

    // Simpan file ke GridFS (MongoDB) — BUKAN ke folder uploads
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(req.file.originalname)}`;
    const gridFsId = await uploadToGridFS(req.file.buffer, filename, req.file.mimetype);
    const imageUrl = `/api/images/${gridFsId}`;

    await incrementScanCount(userId);
    const saved = await saveMoodEntry(result, userId, 'upload', imageUrl, gridFsId);
    const stats = await getDashboardStats(userId);

    broadcast('detection',    { ...result, entryId: saved._id, imageUrl });
    broadcast('stats_update', stats);

    res.json({
      success: true, message: 'Detected from image',
      data: { detection: result, entryId: saved._id, imageUrl, dailyLimit: stats.dailyLimit },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Upload detection failed', error: (e as Error).message });
  }
};