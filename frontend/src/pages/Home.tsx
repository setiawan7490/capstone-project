import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import PageLayout from '../components/PageLayout';
import StatCard from '../components/StatCard';
import SectionTitle from '../components/SectionTitle';
import { useWebSocket } from '../hooks/useWebSocket';
import { apiGetDashboardStats, apiGetHistory } from '../services/index';
import { DashboardStats, MoodEntry } from '../types';
import { EMOTION_META, formatTime } from '../utils/emotionMeta';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const [sRes, hRes] = await Promise.all([
      apiGetDashboardStats(),
      apiGetHistory({ limit: 3, filter: 'all' }),
    ]);
    if (sRes.success && sRes.data) setStats(sRes.data);
    if (hRes.success && hRes.data) setRecent(hRes.data.entries);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useWebSocket({
    onStatsUpdate: (data) => setStats(data),
    onDetection: () => apiGetHistory({ limit: 3 }).then(r => { if (r.success && r.data) setRecent(r.data.entries); }),
  });

  const chartData = stats?.last7DaysDistribution.map(d => ({
    name: d.emotion, count: d.count, color: EMOTION_META[d.emotion].color,
  })) || [];

  return (
    <PageLayout>
      {/* Hero */}
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,background:'var(--bg-hero)',borderRadius:16,padding:'32px 28px',marginBottom:36 }} className="grid-2">
        <div>
          <h1 style={{ fontSize:30,fontWeight:800,color:'var(--text)',lineHeight:1.25,marginBottom:10 }}>
            Halo, {user?.name.split(' ')[0]}! 👋<br />
            <span style={{ fontSize:24 }}>Discover Your Mood</span>
          </h1>
          <p style={{ color:'var(--text-2)',fontSize:15,marginBottom:22 }}>Deteksi emosi wajah kamu secara real-time menggunakan webcam atau upload foto.</p>
          <div style={{ display:'flex',gap:10,flexWrap:'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/detection')}>📷 Mulai Deteksi</button>
            <button className="btn btn-secondary" onClick={() => navigate('/upload')}>📂 Upload Foto</button>
          </div>
          <div style={{ display:'flex',gap:10,marginTop:20,flexWrap:'wrap' }}>
            {Object.values(EMOTION_META).map(m => (
              <div key={m.emoji} style={{ textAlign:'center' }}>
                <div style={{ width:52,height:44,background:'var(--border)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,marginBottom:2 }}>{m.emoji}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background:'var(--bg-camera)',borderRadius:12,padding:16,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:200 }}>
          <div style={{ fontSize:56,marginBottom:12 }}>📷</div>
          <p style={{ color:'#6b7280',fontSize:14,textAlign:'center',marginBottom:16 }}>Klik tombol di bawah untuk membuka kamera dan mulai deteksi emosi secara real-time.</p>
          <button className="btn btn-primary" onClick={() => navigate('/detection')}>▶ Buka Kamera</button>
        </div>
      </div>

      {/* Stats */}
      <SectionTitle title="Your Mood Statistics Overview" />
      {loading ? (
        <div style={{ textAlign:'center',padding:40,color:'var(--text-3)' }}>⏳ Memuat statistik...</div>
      ) : (
        <>
          <div className="card" style={{ padding:'16px 20px',marginBottom:16 }}>
            <div style={{ fontSize:13,color:'var(--text-3)',marginBottom:12 }}>Emotion Distribution (Last 7 Days)</div>
            {chartData.every(d => d.count === 0) ? (
              <div style={{ textAlign:'center',padding:'24px 0',color:'var(--text-3)',fontSize:14 }}>
                Belum ada data. Mulai deteksi untuk melihat statistik!
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize:11,fill:'var(--text-2)' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:8 }} />
                  <Bar dataKey="count" radius={[4,4,0,0]}>
                    {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div style={{ display:'flex',gap:12,marginBottom:36,flexWrap:'wrap' }} className="grid-4">
            <StatCard emoji="" count={stats?.totalDetections||0} label="Total Detections" isBlue />
            <StatCard emoji="😄" count={stats?.emotionCounts.Happy||0} label="Happy" />
            <StatCard emoji="😢" count={stats?.emotionCounts.Sad||0} label="Sad" />
            <StatCard emoji="😠" count={stats?.emotionCounts.Angry||0} label="Angry" />
          </div>
        </>
      )}

      {/* Recent History */}
      <SectionTitle title="Recent Mood History" />
      {recent.length === 0 ? (
        <div style={{ textAlign:'center',padding:32,color:'var(--text-3)' }}>
          Belum ada riwayat. <button className="btn btn-primary" style={{ marginLeft:8 }} onClick={() => navigate('/detection')}>Mulai Deteksi</button>
        </div>
      ) : (
        <>
          {recent.map(e => {
            const meta = EMOTION_META[e.dominantEmotion];
            return (
              <div key={e._id} className="card" style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',marginBottom:8 }}>
                <div style={{ display:'flex',alignItems:'center',gap:12 }}>
                  <div style={{ width:40,height:40,borderRadius:'50%',background:'var(--bg-accent)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20 }}>{meta.emoji}</div>
                  <div>
                    <div style={{ fontSize:13,color:'var(--text-3)' }}>{formatTime(e.detectedAt)}</div>
                    <div style={{ fontWeight:600,fontSize:15 }}>{e.dominantEmotion} <span style={{ fontSize:12,color:'var(--text-3)' }}>{e.dominantConfidence.toFixed(1)}%</span></div>
                  </div>
                </div>
                <button className="btn btn-secondary" style={{ padding:'5px 12px',fontSize:12 }} onClick={() => navigate(`/result/${e._id}`)}>View More</button>
              </div>
            );
          })}
          <button className="btn btn-secondary" style={{ width:'100%',justifyContent:'center',marginTop:8 }} onClick={() => navigate('/history')}>Lihat Semua Riwayat</button>
        </>
      )}
    </PageLayout>
  );
};
export default Home;