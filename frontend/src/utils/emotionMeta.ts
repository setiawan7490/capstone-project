import { EmotionType } from '../types';

interface EmotionMeta {
  emoji: string;
  color: string;
  label: string;
}

export const EMOTION_META: Record<EmotionType, EmotionMeta> = {
  Happy:    { emoji: '😄', color: '#22c55e', label: 'Happy'    },
  Sad:      { emoji: '😢', color: '#3b82f6', label: 'Sad'      },
  Angry:    { emoji: '😠', color: '#ef4444', label: 'Angry'    },
  Fear:     { emoji: '😨', color: '#f59e0b', label: 'Fear'     },
  Surprise: { emoji: '😮', color: '#a855f7', label: 'Surprise' },
  Neutral:  { emoji: '😐', color: '#06b6d4', label: 'Neutral'  },
};

export const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  const dateStr = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
  const timeStr = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  return `${dateStr} • ${timeStr}`;
};