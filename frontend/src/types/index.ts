export type EmotionType = 'Happy' | 'Sad' | 'Angry' | 'Fear' | 'Surprise' | 'Neutral';

export interface EmotionScore {
  emotion: EmotionType;
  confidence: number;
}

export interface MoodEntry {
  _id: string;
  dominantEmotion: EmotionType;
  dominantConfidence: number;
  allEmotions: EmotionScore[];
  detectedAt: string;
  source: 'camera' | 'upload';
  imageUrl?: string;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DashboardStats {
  totalDetections: number;
  emotionCounts: Record<EmotionType, number>;
  todayDominantMood: EmotionType | null;
  todayDominantPercent: number;
  last7DaysDistribution: Array<{ emotion: EmotionType; count: number }>;
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

export type Theme = 'light' | 'dark';