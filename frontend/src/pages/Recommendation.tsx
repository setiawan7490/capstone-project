import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import SectionTitle from '../components/SectionTitle';
import { apiGetHistoryById } from '../services/index';
import { MoodEntry, EmotionType } from '../types';
import { EMOTION_META, formatTime } from '../utils/emotionMeta';

const RECS: Record<EmotionType, { icon: string; text: string }[]> = {
  Happy:    [{ icon:'🌟',text:'Bagikan semangat positifmu kepada orang sekitar.' },{ icon:'📝',text:'Catat hal-hal yang membuatmu bahagia hari ini.' },{ icon:'🎵',text:'Putar lagu favoritmu dan nikmati momen ini.' },{ icon:'💪',text:'Gunakan energi ini untuk menyelesaikan tugas penting.' }],
  Sad:      [{ icon:'🌿',text:'Ambil jeda sejenak dan hirup udara segar di luar.' },{ icon:'🎵',text:'Dengarkan musik yang menenangkan.' },{ icon:'🫁',text:'Latihan pernapasan: tarik 4s, tahan 4s, hembuskan 4s.' },{ icon:'☕',text:'Buat minuman hangat dan berikan dirimu waktu tenang.' }],
  Angry:    [{ icon:'🧘',text:'Tarik napas dalam-dalam selama beberapa menit.' },{ icon:'🚶',text:'Berjalan kaki sebentar untuk menenangkan pikiran.' },{ icon:'💧',text:'Minum air putih — dehidrasi bisa memperburuk emosi.' },{ icon:'📓',text:'Tulis apa yang membuatmu marah sebagai cara meluapkan.' }],
  Fear:     [{ icon:'🌟',text:'Ingat: kamu pernah melewati hal sulit dan berhasil.' },{ icon:'🫁',text:'Latihan pernapasan 4-7-8: tarik 4s, tahan 7s, hembuskan 8s.' },{ icon:'💬',text:'Ceritakan kekhawatiranmu ke orang terpercaya.' },{ icon:'📋',text:'Buat daftar langkah kecil untuk menghadapi rasa takutmu.' }],
  Surprise: [{ icon:'😄',text:'Peluk momen mengejutkan ini — hidup penuh kejutan indah!' },{ icon:'📝',text:'Catat pengalaman ini sebagai kenangan berharga.' },{ icon:'💬',text:'Bagikan ceritamu kepada orang terdekat.' },{ icon:'🌱',text:'Kejutan adalah tanda hidup terus bergerak maju.' }],
  Neutral:  [{ icon:'🧘',text:'Manfaatkan ketenangan ini untuk fokus pada prioritasmu.' },{ icon:'📚',text:'Baca artikel atau buku yang sudah lama ingin dibaca.' },{ icon:'🌿',text:'Jalan-jalan singkat bisa menyegarkan pikiran.' },{ icon:'🎯',text:'Buat rencana untuk hal yang ingin dicapai hari ini.' }],
};

const QUOTES: Record<EmotionType, string> = {
  Happy:    '"Happiness is contagious — keep smiling! 😊"',
  Sad:      '"It\'s okay to not feel okay. Take it one step at a time. 💙"',
  Angry:    '"Breathe. This moment shall pass. 💪"',
  Fear:     '"Courage is not the absence of fear, but action despite it. 🌟"',
  Surprise: '"Life\'s surprises make the story interesting! 🎉"',
  Neutral:  '"A calm mind is a powerful mind. 🧘"',
};

const Recommendation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<MoodEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { navigate('/'); return; }
    apiGetHistoryById(id).then(res => { if (res.success && res.data) setEntry(res.data); setLoading(false); });
  }, [id, navigate]);

  if (loading) return <PageLayout><div style={{ textAlign:'center',padding:60,color:'var(--text-3)' }}>⏳ Memuat...</div></PageLayout>;
  if (!entry) return <PageLayout><div style={{ textAlign:'center',padding:60,color:'var(--text-3)' }}>Data tidak ditemukan.</div></PageLayout>;

  const meta = EMOTION_META[entry.dominantEmotion];

  return (
    <PageLayout>
      <SectionTitle title="Mood Recommendation" />
      <div className="card" style={{ padding:'18px 22px',marginBottom:16,display:'flex',alignItems:'center',gap:16 }}>
        <div style={{ width:56,height:56,borderRadius:'50%',background:'var(--bg-accent)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0 }}>{meta.emoji}</div>
        <div>
          <div style={{ fontSize:20,fontWeight:700,color:'var(--text)',marginBottom:4 }}>You seem {entry.dominantEmotion} today</div>
          <div style={{ fontSize:13,color:'var(--text-3)' }}>{formatTime(entry.detectedAt)} · Confidence: {entry.dominantConfidence.toFixed(1)}%</div>
        </div>
      </div>

      <div className="card" style={{ padding:'20px 22px',marginBottom:16 }}>
        <div style={{ fontWeight:700,fontSize:16,marginBottom:14,display:'flex',alignItems:'center',gap:8 }}>💡 Recommendation for You</div>
        {RECS[entry.dominantEmotion].map((r,i) => (
          <div key={i} style={{ display:'flex',alignItems:'flex-start',gap:10,marginBottom:i<3?14:0 }}>
            <span style={{ fontSize:20,flexShrink:0 }}>{r.icon}</span>
            <span style={{ fontSize:15,color:'var(--text-2)',lineHeight:1.5 }}>{r.text}</span>
          </div>
        ))}
      </div>

      <div style={{ background:'var(--bg-accent)',borderRadius:12,padding:'18px 22px',marginBottom:28 }}>
        <div style={{ fontSize:16,fontWeight:600,color:'var(--brand)',marginBottom:6 }}>{QUOTES[entry.dominantEmotion]}</div>
        <div style={{ fontSize:13,color:'var(--text-3)' }}>Mood Detector cares about your wellbeing.</div>
      </div>

      <div style={{ display:'flex',gap:10,flexWrap:'wrap' }}>
        <button className="btn btn-primary" onClick={()=>navigate('/detection')}>📸 Detect Again</button>
        <button className="btn btn-secondary" onClick={()=>navigate('/dashboard')}>📊 Dashboard</button>
        <button className="btn btn-secondary" onClick={()=>navigate('/history')}>📋 History</button>
      </div>
    </PageLayout>
  );
};
export default Recommendation;