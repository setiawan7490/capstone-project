import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import SectionTitle from '../components/SectionTitle';
import { fetchHistoryById } from '../services';
import { MoodEntry, EmotionType } from '../types';
import { EMOTION_META, formatDateTime } from '../utils/emotionMeta';

const RECS: Record<EmotionType, { icon: string; text: string }[]> = {
  Happy: [
    { icon: '🌟', text: 'Bagikan semangat positifmu kepada orang di sekitarmu.' },
    { icon: '📝', text: 'Tuliskan hal-hal yang membuatmu bahagia hari ini di jurnal.' },
    { icon: '🎵', text: 'Putar lagu favoritmu dan nikmati momen ini.' },
    { icon: '💪', text: 'Gunakan energi positif ini untuk menyelesaikan tugas penting.' },
  ],
  Sad: [
    { icon: '🌿', text: 'Ambil jeda sejenak dan keluar menghirup udara segar.' },
    { icon: '🎵', text: 'Dengarkan musik yang menenangkan atau yang kamu suka.' },
    { icon: '🫁', text: 'Coba latihan pernapasan: tarik napas 4 detik, tahan 4 detik, hembuskan 4 detik.' },
    { icon: '☕', text: 'Buat minuman hangat dan berikan dirimu 10 menit ketenangan.' },
  ],
  Angry: [
    { icon: '🧘', text: 'Coba tarik napas dalam-dalam selama beberapa menit.' },
    { icon: '🚶', text: 'Berjalan kaki sebentar untuk menenangkan pikiran.' },
    { icon: '💧', text: 'Minum air putih — dehidrasi bisa memperburuk emosi negatif.' },
    { icon: '📓', text: 'Tulis apa yang membuatmu marah sebagai cara meluapkan perasaan.' },
  ],
  Fear: [
    { icon: '🌟', text: 'Ingat: kamu pernah menghadapi hal sulit sebelumnya dan berhasil.' },
    { icon: '🫁', text: 'Latihan pernapasan: tarik napas 4s, tahan 7s, hembuskan 8s.' },
    { icon: '💬', text: 'Ceritakan kekhawatiranmu ke orang yang kamu percaya.' },
    { icon: '📋', text: 'Buat daftar langkah kecil untuk menghadapi ketakutanmu.' },
  ],
  Surprise: [
    { icon: '😄', text: 'Peluk momen mengejutkan ini — hidup penuh dengan kejutan indah!' },
    { icon: '📝', text: 'Catat pengalaman ini karena bisa jadi kenangan berharga.' },
    { icon: '💬', text: 'Bagikan ceritamu kepada orang terdekat.' },
    { icon: '🌱', text: 'Kejutan adalah tanda bahwa hidup selalu bergerak maju.' },
  ],
  Neutral: [
    { icon: '🧘', text: 'Manfaatkan ketenangan ini untuk fokus pada prioritasmu.' },
    { icon: '📚', text: 'Baca buku atau artikel yang sudah lama ingin kamu baca.' },
    { icon: '🌿', text: 'Jalan-jalan singkat di luar ruangan bisa menyegarkan pikiran.' },
    { icon: '🎯', text: 'Buat rencana untuk hal yang ingin kamu capai hari ini.' },
  ],
};

const QUOTES: Record<EmotionType, string> = {
  Happy:    '"Happiness is contagious — keep smiling! 😊"',
  Sad:      '"It\'s okay to not feel okay. Take it one step at a time. 💙"',
  Angry:    '"Breathe. This moment shall pass. 💪"',
  Fear:     '"Courage is not the absence of fear, but taking action despite it. 🌟"',
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
    fetchHistoryById(id).then(res => {
      if (res.success && res.data) setEntry(res.data);
      setLoading(false);
    });
  }, [id, navigate]);

  if (loading) return <PageLayout><div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Memuat...</div></PageLayout>;
  if (!entry) return <PageLayout><div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Data tidak ditemukan.</div></PageLayout>;

  const meta = EMOTION_META[entry.dominantEmotion];
  const recs = RECS[entry.dominantEmotion];
  const quote = QUOTES[entry.dominantEmotion];

  return (
    <PageLayout>
      <SectionTitle title="Mood Recommendation" />

      {/* Mood Card */}
      <div className="card" style={{ padding: '18px 22px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'var(--bg-accent)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0,
        }}>{meta.emoji}</div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            You seem {entry.dominantEmotion} today
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {formatDateTime(entry.detectedAt)} • Confidence: {entry.dominantConfidence.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="card" style={{ padding: '20px 22px', marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          💡 Recommendation for You
        </div>
        {recs.map((r, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            marginBottom: i < recs.length - 1 ? 14 : 0,
          }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>{r.icon}</span>
            <span style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r.text}</span>
          </div>
        ))}
      </div>

      {/* Quote */}
      <div style={{ background: 'var(--bg-accent)', borderRadius: 12, padding: '18px 22px', marginBottom: 32 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--brand)', marginBottom: 6 }}>{quote}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Mood Detector cares about your wellbeing.</div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn-primary" onClick={() => navigate('/detection')}>📸 Detect Again</button>
        <button className="btn-secondary" onClick={() => navigate('/dashboard')}>📊 View Dashboard</button>
        <button className="btn-secondary" onClick={() => navigate('/history')}>📋 View History</button>
      </div>
    </PageLayout>
  );
};

export default Recommendation;