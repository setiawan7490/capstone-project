export type EmotionType =
  | 'Happy'
  | 'Sad'
  | 'Angry'
  | 'Fear'
  | 'Surprise'
  | 'Neutral';

export interface EmotionScore {
  emotion: EmotionType;
  confidence: number; // 0–100
}

export interface DetectionResult {
  dominantEmotion: EmotionType;
  dominantConfidence: number;
  allEmotions: EmotionScore[];
  detectedAt: Date;
}

export interface IMoodEntry {
  _id?: string;
  dominantEmotion: EmotionType;
  dominantConfidence: number;
  allEmotions: EmotionScore[];
  detectedAt: Date;
  source: 'camera' | 'upload';
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DashboardStats {
  totalDetections: number;
  emotionCounts: Record<EmotionType, number>;
  todayDominantMood: EmotionType | null;
  todayDominantPercent: number;
  last7DaysDistribution: Array<{
    emotion: EmotionType;
    count: number;
  }>;
  weeklyTrend: Array<{
    day: string;
    date: string;
    counts: Partial<Record<EmotionType, number>>;
  }>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}