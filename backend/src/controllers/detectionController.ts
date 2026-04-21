import { Request, Response } from 'express';
import { mockDetectEmotion } from '../services/emotionService';
import { saveMoodEntry, getDashboardStats } from '../services/historyService';
import { ApiResponse, DetectionResult } from '../types';
import { broadcast } from '../config/websocket';
import fs from 'fs';

/**
 * POST /api/detect/camera
 */
export const detectFromCamera = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result: DetectionResult = await mockDetectEmotion();

    const saved = await saveMoodEntry(result, 'camera');

    // 🔥 REALTIME BROADCAST DETECTION
    broadcast('detection', {
      entryId: saved._id?.toString(),
      dominantEmotion: result.dominantEmotion,
      dominantConfidence: result.dominantConfidence,
      allEmotions: result.allEmotions,
      detectedAt: result.detectedAt,
      source: 'camera',
    });

    // 🔥 REALTIME UPDATE STATS
    const stats = await getDashboardStats();
    broadcast('stats_update', stats);

    const response: ApiResponse = {
      success: true,
      message: 'Emotion detected successfully',
      data: {
        detection: result,
        entryId: saved._id?.toString() || '',
      },
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Detection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse);
  }
};

/**
 * POST /api/detect/upload
 */
export const detectFromUpload = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No image file provided',
      } as ApiResponse);
      return;
    }

    const imageBuffer = fs.readFileSync(req.file.path);
    const result: DetectionResult = await mockDetectEmotion(imageBuffer);

    const imageUrl = `/uploads/${req.file.filename}`;

    const saved = await saveMoodEntry(result, 'upload', imageUrl);

    // 🔥 REALTIME BROADCAST DETECTION
    broadcast('detection', {
      entryId: saved._id?.toString(),
      dominantEmotion: result.dominantEmotion,
      dominantConfidence: result.dominantConfidence,
      allEmotions: result.allEmotions,
      detectedAt: result.detectedAt,
      source: 'upload',
      imageUrl,
    });

    // 🔥 REALTIME UPDATE STATS
    const stats = await getDashboardStats();
    broadcast('stats_update', stats);

    const response: ApiResponse = {
      success: true,
      message: 'Emotion detected from uploaded image',
      data: {
        detection: result,
        entryId: saved._id?.toString() || '',
        imageUrl,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Upload detection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse);
  }
};