import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import PageLayout from '../components/PageLayout';
import StatCard from '../components/StatCard';
import SectionTitle from '../components/SectionTitle';
import MoodHistoryItem from '../components/MoodHistoryItem';
import { useWebSocket } from '../hooks/useWebSocket';
import { fetchDashboardStats, fetchHistory } from '../services';
import { DashboardStats, MoodEntry } from '../types';
import { EMOTION_META } from '../utils/emotionMeta';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const [statsRes, histRes] = await Promise.all([
      fetchDashboardStats(),
      fetchHistory({ limit: 3, filter: 'all' }),
    ]);
    if (statsRes.success && statsRes.data) setStats(statsRes.data);
    if (histRes.success && histRes.data) setRecent(histRes.data.entries);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Realtime update via WebSocket
  useWebSocket({
    onStatsUpdate: (data) => setStats(data),
    onDetection: () => {
      fetchHistory({ limit: 3, filter: 'all' }).then(r => {
        if (r.success && r.data) setRecent(r.data.entries);
      });
    },
  });

  const chartData = stats?.last7DaysDistribution.map(d => ({
    name: d.emotion,
    count: d.count,
    color: EMOTION_META[d.emotion].color,
  })) || [];

  return (
    <PageLayout>
      {/* Hero */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24,
        background: 'var(--bg-hero)', borderRadius: 16,
        padding: '32px 28px', marginBottom: 36,
      }} className="grid-2">
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: 10 }}>
            Discover Your Mood<br />from Your Facial Expression
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 22 }}>
            Detect your current emotion in real-time using your webcam.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => navigate('/detection')}>▶ Start Detection</button>
            <button className="btn-secondary" onClick={() => navigate('/upload')}>📂 Upload Image</button>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
            {Object.values(EMOTION_META).map(m => (
              <div key={m.label} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 64, height: 52, background: 'var(--border)',
                  borderRadius: 8, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 22, marginBottom: 3,
                }}>{m.emoji}</div>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Camera Preview */}
        <div style={{ background: 'var(--bg-camera)', borderRadius: 12, padding: 16 }}>
          <div style={{
            border: '2px solid var(--brand)', borderRadius: 8,
            height: 180, display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#6b7280', fontSize: 14,
            marginBottom: 10,
          }}>
            [ Camera Feed ]
          </div>
          {stats?.todayDominantMood && (
            <div style={{ textAlign: 'center', color: '#fff', marginBottom: 10, fontSize: 14 }}>
              {EMOTION_META[stats.todayDominantMood].emoji} {stats.todayDominantMood} ({stats.todayDominantPercent}%)
            </div>
          )}
          <div style={{ textAlign: 'center' }}>
            <button className="btn-secondary" style={{ fontSize: 13 }} onClick={() => navigate('/detection')}>
              Open Camera
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <SectionTitle title="Your Mood Statistics Overview" />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading stats...</div>
      ) : (
        <>
          <div className="card" style={{ padding: '16px 20px', marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
              Emotion Distribution (Last 7 Days)
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 36, flexWrap: 'wrap' }} className="grid-4">
            <StatCard emoji="" count={stats?.totalDetections || 0} label="Total Detections" isBlue />
            <StatCard emoji="😄" count={stats?.emotionCounts.Happy || 0} label="Happy" />
            <StatCard emoji="😢" count={stats?.emotionCounts.Sad || 0} label="Sad" />
            <StatCard emoji="😠" count={stats?.emotionCounts.Angry || 0} label="Angry" />
          </div>
        </>
      )}

      {/* Recent History */}
      <SectionTitle title="Recent Mood History" />
      {recent.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
          No detection history yet. <button className="btn-primary" style={{ marginLeft: 8 }} onClick={() => navigate('/detection')}>Start Detection</button>
        </div>
      ) : (
        <>
          {recent.map(e => <MoodHistoryItem key={e._id} entry={e} />)}
          <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} onClick={() => navigate('/history')}>
            View All History
          </button>
        </>
      )}
    </PageLayout>
  );
};

export default Home;