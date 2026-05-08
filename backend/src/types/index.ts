export type EmotionType = 'Angry' | 'Fear' | 'Happy' | 'Sad' | 'Surprise' | 'Neutral';

export interface EmotionScore {
  emotion: EmotionType;
  confidence: number;
}

export interface DetectionResult {
  dominantEmotion: EmotionType;
  dominantConfidence: number;
  allEmotions: EmotionScore[];
  detectedAt: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}