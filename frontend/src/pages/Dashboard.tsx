import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend } from 'recharts';
import PageLayout from '../components/PageLayout';
import SectionTitle from '../components/SectionTitle';
import StatCard from '../components/StatCard';
import { apiGetDashboardStats } from '../services/index';
import { DashboardStats, EmotionType } from '../types';
import { EMOTION_META } from '../utils/emotionMeta';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuth } from '../contexts/AuthContext';

const quickActions = [
  { icon:'📷', label:'Scan Wajah', path:'/detection', color:'#3b82f6' },
  { icon:'📂', label:'Upload Foto', path:'/upload',    color:'#8b5cf6' },
  { icon:'📋', label:'Riwayat',     path:'/history',   color:'#10b981' },
];

const Dashboard: React.FC = () => {
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const [stats,    setStats]    = useState<DashboardStats | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [lastUpd,  setLastUpd]  = useState<Date | null>(null);

  const load = useCallback(async () => {
    const res = await apiGetDashboardStats();
    if (res.success && res.data) { setStats(res.data); setLastUpd(new Date()); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useWebSocket({ onStatsUpdate: (d) => { setStats(d); setLastUpd(new Date()); } });

  const barData  = stats?.last7DaysDistribution.map(d => ({ name:d.emotion, count:d.count, color:EMOTION_META[d.emotion].color })) || [];
  const lineData = stats?.weeklyTrend.map(d => ({ day:d.day, Happy:d.counts.Happy||0, Sad:d.counts.Sad||0, Angry:d.counts.Angry||0 })) || [];
  const tip = { contentStyle:{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8 } };
  const hasData = barData.some(d => d.count > 0);

  return (
    <PageLayout>
      {/* Greeting */}
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:26, fontWeight:800, color:'var(--text)', marginBottom:4 }}>
          Halo, {user?.name.split(' ')[0]}! 👋
        </h1>
        <p style={{ color:'var(--text-2)', fontSize:15 }}>Selamat datang di Mood Detector. Pilih fitur yang ingin kamu gunakan.</p>
      </div>

      {/* Quick Actions */}
      <div style={{ display:'flex', gap:14, marginBottom:32, flexWrap:'wrap' }}>
        {quickActions.map(a => (
          <button key={a.path} onClick={() => navigate(a.path)}
            style={{ flex:'1 1 140px', minWidth:140, padding:'20px 16px', borderRadius:14,
              background:a.color, color:'#fff', border:'none', cursor:'pointer',
              display:'flex', flexDirection:'column', alignItems:'center', gap:10,
              boxShadow:`0 4px 14px ${a.color}40`, transition:'transform .15s' }}
            onMouseEnter={e => (e.currentTarget.style.transform='translateY(-3px)')}
            onMouseLeave={e => (e.currentTarget.style.transform='translateY(0)')}>
            <span style={{ fontSize:32 }}>{a.icon}</span>
            <span style={{ fontWeight:700, fontSize:15 }}>{a.label}</span>
          </button>
        ))}
      </div>

      {/* Stats header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
        <SectionTitle title="Statistik Mood Kamu" />
        {lastUpd && <span style={{ fontSize:12, color:'var(--text-3)' }}>● Live · {lastUpd.toLocaleTimeString('id-ID')}</span>}
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:60, color:'var(--text-3)' }}>⏳ Memuat data...</div>
      ) : !hasData ? (
        /* Empty state */
        <div className="card" style={{ padding:'48px 24px', textAlign:'center' }}>
          <div style={{ fontSize:56, marginBottom:16 }}>📊</div>
          <h3 style={{ fontSize:20, fontWeight:700, marginBottom:8 }}>Belum ada data</h3>
          <p style={{ color:'var(--text-2)', fontSize:15, marginBottom:24 }}>Mulai scan wajah untuk melihat statistik mood kamu di sini.</p>
          <button className="btn btn-primary" style={{ fontSize:15, padding:'11px 28px' }} onClick={() => navigate('/detection')}>
            📷 Mulai Scan Sekarang
          </button>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }} className="grid-4">
            <StatCard emoji="" count={stats?.totalDetections||0} label="Total Detections" isBlue />
            <StatCard emoji="😄" count={stats?.emotionCounts.Happy||0}    label="Happy" />
            <StatCard emoji="😢" count={stats?.emotionCounts.Sad||0}      label="Sad" />
            <StatCard emoji="😠" count={stats?.emotionCounts.Angry||0}    label="Angry" />
          </div>

          {/* Bar chart */}
          <div className="card" style={{ padding:20, marginBottom:16 }}>
            <div style={{ fontWeight:600, fontSize:15, marginBottom:14 }}>Emotion Distribution (Last 7 Days)</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{ fontSize:12, fill:'var(--text-2)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:'var(--text-3)' }} axisLine={false} tickLine={false} />
                <Tooltip {...tip} />
                <Bar dataKey="count" radius={[4,4,0,0]}>{barData.map((d,i)=><Cell key={i} fill={d.color}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Line chart */}
          <div className="card" style={{ padding:20, marginBottom:16 }}>
            <div style={{ fontWeight:600, fontSize:15, marginBottom:14 }}>Weekly Mood Trend</div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={lineData}>
                <XAxis dataKey="day" tick={{ fontSize:12, fill:'var(--text-2)' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip {...tip} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:12 }} />
                <Line type="monotone" dataKey="Happy" stroke="#22c55e" strokeWidth={2.5} dot={{ r:4 }} />
                <Line type="monotone" dataKey="Sad"   stroke="#3b82f6" strokeWidth={2.5} dot={{ r:4 }} />
                <Line type="monotone" dataKey="Angry" stroke="#ef4444" strokeWidth={2.5} dot={{ r:4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Dominant mood */}
          <div className="card" style={{ padding:'18px 22px', display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
            <span style={{ fontSize:20 }}>🏆</span>
            <span style={{ fontWeight:600, fontSize:15, color:'var(--text-2)' }}>Today's Dominant Mood:</span>
            {stats?.todayDominantMood
              ? <><span style={{ fontSize:18 }}>{EMOTION_META[stats.todayDominantMood].emoji}</span>
                  <span style={{ color:'var(--brand)', fontWeight:700, fontSize:16 }}>
                    {stats.todayDominantMood} ({stats.todayDominantPercent}% of today's detections)
                  </span></>
              : <span style={{ color:'var(--text-3)', fontSize:14 }}>Belum ada deteksi hari ini</span>}
          </div>
        </>
      )}
    </PageLayout>
  );
};
export default Dashboard;