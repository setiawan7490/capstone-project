import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import SectionTitle from '../components/SectionTitle';

const emotionBreakdown = [
  { emoji: '😄', label: 'Happy', pct: 98 },
  { emoji: '😮', label: 'Surprise', pct: 5 },
  { emoji: '😐', label: 'Neutral', pct: 3 },
  { emoji: '😢', label: 'Sad', pct: 1 },
];

const Result: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <SectionTitle title="Analysis Result" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Left: Emotion Info */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
          {/* Primary Emotion */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: '#dbeafe', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 40, flexShrink: 0,
            }}>
              😄
            </div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#111827', marginBottom: 4 }}>Happy</div>
              <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>Primary Emotion</div>
              <div style={{ height: 8, width: 200, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '98%', background: '#3b82f6', borderRadius: 4 }} />
              </div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>98.2% confidence</div>
            </div>
          </div>

          {/* Breakdown */}
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 12 }}>Emotion Breakdown</div>
            {emotionBreakdown.map(e => (
              <div key={e.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 18, width: 24 }}>{e.emoji}</span>
                <span style={{ fontSize: 14, color: '#374151', width: 70 }}>{e.label}</span>
                <div style={{ flex: 1, height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${e.pct}%`, background: '#3b82f6', borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 13, color: '#6b7280', width: 30, textAlign: 'right' }}>{e.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Captured Image */}
        <div style={{
          background: '#d1d5db', border: '1px solid #e5e7eb',
          borderRadius: 12, display: 'flex', alignItems: 'center',
          justifyContent: 'center', minHeight: 320, position: 'relative',
        }}>
          <div style={{
            border: '2px solid #3b82f6', borderRadius: 4,
            width: 200, height: 220,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#6b7280', fontSize: 15,
          }}>
            [ Captured Image ]
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      <div style={{
        background: '#dbeafe', borderRadius: 12,
        padding: '20px 24px', marginBottom: 24,
      }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 6 }}>
          💬 You look happy today!
        </div>
        <div style={{ fontSize: 15, color: '#374151' }}>
          Keep spreading that positive energy. Stay hydrated and enjoy your day! 😊
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          💾 Save Result
        </button>
        <button onClick={() => navigate('/')} style={{ background: '#fff', color: '#374151', border: '1px solid #d1d5db', padding: '10px 20px', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}>
          ↩ Detect Again
        </button>
        <button style={{ background: '#fff', color: '#374151', border: '1px solid #d1d5db', padding: '10px 20px', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}>
          📤 Share
        </button>
        <button onClick={() => navigate('/dashboard')} style={{ background: '#fff', color: '#374151', border: '1px solid #d1d5db', padding: '10px 20px', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}>
          📊 View Dashboard
        </button>
      </div>
    </PageLayout>
  );
};

export default Result;