import { EmotionType } from '../types';

export const EMOTION_META: Record<EmotionType, { emoji: string; color: string }> = {
  Happy:    { emoji: '😄', color: '#22c55e' },
  Sad:      { emoji: '😢', color: '#3b82f6' },
  Angry:    { emoji: '😠', color: '#ef4444' },
  Fear:     { emoji: '😨', color: '#f59e0b' },
  Surprise: { emoji: '😮', color: '#a855f7' },
  Neutral:  { emoji: '😐', color: '#06b6d4' },
};

// ✅ FIX: tambahkan alias supaya tidak error
export const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// optional (tetap ada versi lama juga)
export const formatTime = formatDateTime;