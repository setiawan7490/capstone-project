import React, { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, Legend,
} from 'recharts';
import PageLayout from '../components/PageLayout';
import SectionTitle from '../components/SectionTitle';
import StatCard from '../components/StatCard';
import { fetchDashboardStats } from '../services';
import { DashboardStats, EmotionType } from '../types';
import { EMOTION_META } from '../utils/emotionMeta';
import { useWebSocket } from '../hooks/useWebSocket';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    const res = await fetchDashboardStats();
    if (res.success && res.data) {
      setStats(res.data);
      setLastUpdated(new Date());
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Realtime update via WebSocket
  useWebSocket({
    onStatsUpdate: (data) => {
      setStats(data);
      setLastUpdated(new Date());
    },
  });

  const barData = stats?.last7DaysDistribution.map(d => ({
    name: d.emotion,
    count: d.count,
    color: EMOTION_META[d.emotion].color,
  })) || [];

  const lineData = stats?.weeklyTrend.map(d => ({
    day: d.day,
    Happy: d.counts.Happy || 0,
    Sad: d.counts.Sad || 0,
    Angry: d.counts.Angry || 0,
  })) || [];

  const tooltipStyle = {
    contentStyle: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 },
    labelStyle: { color: 'var(--text-primary)' },
  };

  return (
    <PageLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <SectionTitle title="Mood Dashboard" />
        {lastUpdated && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            ● Live · Updated {lastUpdated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Memuat dashboard...</div>
      ) : (
        <>
          {/* Stat Cards */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }} className="grid-4">
            <StatCard emoji="" count={stats?.totalDetections || 0} label="Total Detections" isBlue />
            <StatCard emoji="😄" count={stats?.emotionCounts.Happy || 0} label="Happy" />
            <StatCard emoji="😢" count={stats?.emotionCounts.Sad || 0} label="Sad" />
            <StatCard emoji="😠" count={stats?.emotionCounts.Angry || 0} label="Angry" />
          </div>

          {/* Bar Chart */}
          <div className="card" style={{ padding: '20px', marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', marginBottom: 16 }}>
              Emotion Distribution (Last 7 Days)
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="count" name="Count" radius={[4, 4, 0, 0]}>
                  {barData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart */}
          <div className="card" style={{ padding: '20px', marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', marginBottom: 16 }}>
              Weekly Mood Trend
            </div>
            {lineData.every(d => d.Happy === 0 && d.Sad === 0 && d.Angry === 0) ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: 14 }}>
                Belum cukup data untuk menampilkan trend mingguan.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={lineData}>
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip {...tooltipStyle} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
                  <Line type="monotone" dataKey="Happy" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Sad" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Angry" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Today's Dominant */}
          <div className="card" style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 20 }}>🏆</span>
            <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-secondary)' }}>Today's Dominant Mood:</span>
            {stats?.todayDominantMood ? (
              <>
                <span style={{ fontSize: 18 }}>{EMOTION_META[stats.todayDominantMood].emoji}</span>
                <span style={{ color: 'var(--brand)', fontWeight: 700, fontSize: 16 }}>
                  {stats.todayDominantMood} ({stats.todayDominantPercent}% of today's detections)
                </span>
              </>
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Belum ada deteksi hari ini</span>
            )}
          </div>

          {/* Emotion breakdown cards */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', marginBottom: 12 }}>
              All Emotion Counts (All Time)
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {(Object.entries(stats?.emotionCounts || {}) as [EmotionType, number][]).map(([emotion, count]) => (
                <div key={emotion} className="card" style={{ padding: '12px 16px', flex: '1 1 100px', minWidth: 100 }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{EMOTION_META[emotion].emoji}</div>
                  <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--text-primary)' }}>{count}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{emotion}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </PageLayout>
  );
};

export default Dashboard;