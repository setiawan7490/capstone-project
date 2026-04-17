import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import PageLayout from '../components/PageLayout';
import StatCard from '../components/StatCard';
import MoodHistoryItem from '../components/MoodHistory';
import SectionTitle from '../components/SectionTitle';
import { moodHistory, barChartData } from '../services/mockData';

const emotionThumbs = [
  { label: 'Angry', emoji: '😠' },
  { label: 'Fear', emoji: '😨' },
  { label: 'Happy', emoji: '😄' },
  { label: 'Sad', emoji: '😢' },
];

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageLayout>
      {/* Hero Section */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32,
        background: '#eff6ff', borderRadius: 16, padding: '40px 32px',
        marginBottom: 40, alignItems: 'center',
      }}>
        <div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#111827', lineHeight: 1.2, marginBottom: 12 }}>
            Discover Your Mood<br />from Your Facial Expression
          </h1>
          <p style={{ color: '#6b7280', fontSize: 16, marginBottom: 24 }}>
            Detect your current emotion in real-time using your webcam.
          </p>
          <button
            onClick={() => navigate('/detection')}
            style={{
              background: '#3b82f6', color: '#fff', border: 'none',
              padding: '12px 28px', borderRadius: 8, fontWeight: 600,
              fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            ▶ Start Detection
          </button>

          {/* Emotion Thumbnails */}
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            {emotionThumbs.map(e => (
              <div key={e.label} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 80, height: 64, background: '#e5e7eb',
                  borderRadius: 8, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 24, marginBottom: 4,
                }}>
                  {e.emoji}
                </div>
                <span style={{ fontSize: 12, color: '#6b7280' }}>{e.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Camera Feed */}
        <div style={{ background: '#111827', borderRadius: 12, padding: 16 }}>
          <div style={{
            border: '2px solid #3b82f6', borderRadius: 8,
            height: 200, display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#9ca3af', fontSize: 16, marginBottom: 12,
          }}>
            [ Camera Feed ]
          </div>
          <div style={{ textAlign: 'center', color: '#fff', marginBottom: 12, fontSize: 15 }}>
            😄 Happy (98%)
          </div>
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => navigate('/detection')}
              style={{
                padding: '8px 20px', border: '1px solid #6b7280',
                borderRadius: 6, background: '#1f2937', color: '#fff',
                fontSize: 14, cursor: 'pointer',
              }}
            >
              Stop Detection
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <SectionTitle title="Your Mood Statistics Overview" />

      <div style={{
        background: '#fff', border: '1px solid #e5e7eb',
        borderRadius: 12, padding: 20, marginBottom: 20,
      }}>
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>Emotion Distribution (Last 7 Days)</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={barChartData}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis hide />
            <Tooltip />
            <Bar dataKey="thisWeek" fill="#ef4444" name="This Week" radius={[3, 3, 0, 0]}>
              {barChartData.map((entry, index) => (
                <rect key={index} fill={entry.color} />
              ))}
            </Bar>
            <Bar dataKey="lastWeek" fill="#fca5a5" name="Last Week" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 40 }}>
        <StatCard emoji="🔵" count={305} label="Total Detections" isBlue />
        <StatCard emoji="😄" count={185} label="Happy" />
        <StatCard emoji="😢" count={72} label="Sad" />
        <StatCard emoji="😠" count={28} label="Angry" />
      </div>

      {/* Recent History */}
      <SectionTitle title="Recent Mood History" />
      {moodHistory.slice(0, 3).map(entry => (
        <MoodHistoryItem key={entry.id} entry={entry} showDate={false} />
      ))}
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        {['View More', 'View More', 'View More'].map((label, i) => (
          <button
            key={i}
            onClick={() => navigate('/history')}
            style={{
              flex: 1, padding: '8px', border: '1px solid #d1d5db',
              borderRadius: 6, background: '#fff', color: '#374151',
              fontSize: 13, cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </PageLayout>
  );
};

export default Home;