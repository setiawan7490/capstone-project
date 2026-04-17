export type EmotionType = 'Happy' | 'Sad' | 'Angry' | 'Fear' | 'Surprise' | 'Neutral';

export interface MoodEntry {
  id: string;
  emotion: EmotionType;
  emoji: string;
  time: string;
  date: string;
  confidence: number;
}

export interface EmotionStat {
  emotion: EmotionType;
  count: number;
  color: string;
}