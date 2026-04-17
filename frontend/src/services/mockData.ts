import { type MoodEntry, type EmotionStat } from '../types/index';

export const moodHistory: MoodEntry[] = [
  { id: '1', emotion: 'Happy', emoji: '😄', time: '10:32 AM', date: 'Today', confidence: 98.2 },
  { id: '2', emotion: 'Sad', emoji: '😢', time: '09:15 AM', date: 'Today', confidence: 89.4 },
  { id: '3', emotion: 'Neutral', emoji: '😐', time: '07:40 AM', date: 'Today', confidence: 76.1 },
  { id: '4', emotion: 'Surprise', emoji: '😮', time: '15:47 PM', date: 'Yesterday', confidence: 82.3 },
  { id: '5', emotion: 'Happy', emoji: '😄', time: '12:30 PM', date: 'Yesterday', confidence: 94.5 },
  { id: '6', emotion: 'Angry', emoji: '😠', time: '08:10 AM', date: 'Yesterday', confidence: 71.8 },
  { id: '7', emotion: 'Sad', emoji: '😢', time: '20:05 PM', date: 'Mon Mar 31', confidence: 88.2 },
  { id: '8', emotion: 'Happy', emoji: '😄', time: '14:22 PM', date: 'Mon Mar 31', confidence: 96.0 },
  { id: '9', emotion: 'Happy', emoji: '😄', time: '10:00 AM', date: 'Mon Mar 31', confidence: 91.3 },
];

export const emotionStats: EmotionStat[] = [
  { emotion: 'Happy', count: 185, color: '#22c55e' },
  { emotion: 'Sad', count: 72, color: '#3b82f6' },
  { emotion: 'Angry', count: 28, color: '#ef4444' },
  { emotion: 'Fear', count: 20, color: '#f59e0b' },
];

export const barChartData = [
  { name: 'Angry', thisWeek: 28, lastWeek: 22, color: '#ef4444' },
  { name: 'Fear', thisWeek: 20, lastWeek: 15, color: '#f59e0b' },
  { name: 'Happy', thisWeek: 185, lastWeek: 160, color: '#22c55e' },
  { name: 'Sad', thisWeek: 72, lastWeek: 65, color: '#3b82f6' },
  { name: 'Surprise', thisWeek: 35, lastWeek: 28, color: '#a855f7' },
  { name: 'Neutral', thisWeek: 22, lastWeek: 18, color: '#06b6d4' },
];

export const weeklyTrendData = [
  { day: 'Mon', happy: 20, sad: 10, angry: 5 },
  { day: 'Tue', happy: 35, sad: 8, angry: 3 },
  { day: 'Wed', happy: 28, sad: 15, angry: 8 },
  { day: 'Thu', happy: 45, sad: 12, angry: 4 },
  { day: 'Fri', happy: 30, sad: 20, angry: 6 },
  { day: 'Sat', happy: 50, sad: 5, angry: 2 },
  { day: 'Sun', happy: 40, sad: 7, angry: 4 },
];