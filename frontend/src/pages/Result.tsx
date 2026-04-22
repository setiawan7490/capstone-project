import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import SectionTitle from '../components/SectionTitle';
import EmotionBar from '../components/EmotionBar';
import { fetchHistoryById } from '../services';
import { MoodEntry, EmotionType } from '../types';
import { EMOTION_META, formatDateTime } from '../utils/emotionMeta';

const MOTIVATIONAL: Record<EmotionType, string> = {
  Happy:    'Keep spreading that positive energy. Stay hydrated and enjoy your day! 😊',
  Sad:      'It\'s okay to feel sad. Take a breath and be kind to yourself. 💙',
  Angry:    'Take a moment to breathe. Let the tension go — you\'ve got this. 💪',
  Fear:     'Fear is normal. Face it one small step at a time. You are braver than you think. 🌟',
  Surprise: 'Life is full of surprises! Embrace the unexpected moment. 🎉',
  Neutral:  'A calm mind is a powerful mind. Keep it steady! 🧘',
};

const HEADING: Record<EmotionType, string> = {
  Happy:    'You look happy today!',
  Sad:      'You seem a little sad today.',
  Angry:    'You look a bit tense.',
  Fear:     'You seem worried.',
  Surprise: 'You look surprised!',
  Neutral:  'You look calm today.',
};

const Result: React.FC = () => {
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

  if (loading) return (
    <PageLayout>
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading result...</div>
    </PageLayout>
  );

  if (!entry) return (
    <PageLayout>
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
        Result tidak ditemukan. <button className="btn-primary" onClick={() => navigate('/')}>Kembali</button>
      </div>
    </PageLayout>
  );

  const meta = EMOTION_META[entry.dominantEmotion];

  return (
    <PageLayout>
      <SectionTitle title="Analysis Result" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }} className="grid-2">
        {/* Emotion breakdown */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'var(--bg-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 38, flexShrink: 0,
            }}>{meta.emoji}</div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{entry.dominantEmotion}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Primary Emotion</div>
              <div style={{ height: 7, width: 180, background: 'var(--border)', borderRadius: 4 }}>
                <div style={{ height: '100%', width: `${entry.dominantConfidence}%`, background: meta.color, borderRadius: 4 }} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{entry.dominantConfidence.toFixed(1)}% confidence</div>
            </div>
          </div>

          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
            {formatDateTime(entry.detectedAt)} • via {entry.source}
          </div>

          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 10 }}>Emotion Breakdown</div>
          {entry.allEmotions.map(e => (
            <EmotionBar
              key={e.emotion}
              emoji={EMOTION_META[e.emotion as EmotionType]?.emoji || ''}
              label={e.emotion}
              value={e.confidence}
              color={EMOTION_META[e.emotion as EmotionType]?.color}
            />
          ))}
        </div>

        {/* Captured image / placeholder */}
        <div className="card" style={{
          minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg)', overflow: 'hidden',
        }}>
          {entry.imageUrl ? (
            <img src={entry.imageUrl} alt="captured" style={{ width: '100%', height: '100%', objectFit: 'cover', maxHeight: 320 }} />
          ) : (
            <div style={{
              border: '2px solid var(--brand)', borderRadius: 8,
              width: 200, height: 200,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)', fontSize: 14,
            }}>[ Captured Image ]</div>
          )}
        </div>
      </div>

      {/* Message */}
      <div style={{ background: 'var(--bg-accent)', borderRadius: 12, padding: '18px 22px', marginBottom: 20 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
          💬 {HEADING[entry.dominantEmotion]}
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          {MOTIVATIONAL[entry.dominantEmotion]}
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn-primary" onClick={() => navigate('/detection')}>↩ Detect Again</button>
        <button className="btn-secondary" onClick={() => navigate(`/recommendation/${entry._id}`)}>💡 Recommendation</button>
        <button className="btn-secondary" onClick={() => navigate('/dashboard')}>📊 View Dashboard</button>
        <button className="btn-secondary" onClick={() => navigate('/history')}>📋 History</button>
      </div>
    </PageLayout>
  );
};

export default Result;