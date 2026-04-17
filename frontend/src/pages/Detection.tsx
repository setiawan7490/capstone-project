import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import SectionTitle from '../components/SectionTitle';

const emotions = [
  { label: 'Happy', pct: 98.2, color: '#3b82f6' },
  { label: 'Surprise', pct: 1.1, color: '#3b82f6' },
  { label: 'Neutral', pct: 0.7, color: '#3b82f6' },
];

const Detection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <SectionTitle title="Live Camera Detection" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
        {/* Camera Area */}
        <div style={{ background: '#111827', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ position: 'relative', padding: 24, minHeight: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {/* Face detection frame */}
            <div style={{
              border: '2px solid #22c55e', borderRadius: 4,
              width: 260, height: 280, position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {/* Face placeholder */}
              <div style={{
                width: 160, height: 200, borderRadius: '50%',
                background: '#374151', opacity: 0.8,
              }} />
              <div style={{
                position: 'absolute', bottom: 8, left: '50%',
                transform: 'translateX(-50%)', color: '#9ca3af',
                fontSize: 14, whiteSpace: 'nowrap',
              }}>
                [ Live Camera Feed ]
              </div>
            </div>
            <div style={{ color: '#fff', marginTop: 16, fontSize: 16 }}>
              😄 Happy — 98.2%
            </div>
          </div>
        </div>

        {/* Detection Result Panel */}
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb',
          borderRadius: 12, padding: 24,
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Detection Result</h3>

          {/* Main emotion */}
          <div style={{
            background: '#dbeafe', borderRadius: 10,
            padding: '24px 16px', textAlign: 'center', marginBottom: 20,
          }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>😄</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>Happy</div>
            <div style={{ color: '#6b7280', fontSize: 14 }}>Confidence: 98.2%</div>
          </div>

          {/* All Emotions */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, color: '#374151', fontWeight: 600, marginBottom: 12 }}>All Emotions Detected</div>
            {emotions.map(e => (
              <div key={e.label} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 14, color: '#374151' }}>{e.label}</span>
                  <span style={{ fontSize: 14, color: '#374151' }}>{e.pct}%</span>
                </div>
                <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${e.pct}%`, background: e.color, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => navigate('/result')}
              style={{
                flex: 1, background: '#3b82f6', color: '#fff', border: 'none',
                padding: '10px 0', borderRadius: 8, fontWeight: 600,
                fontSize: 14, cursor: 'pointer',
              }}
            >
              📸 Capture Result
            </button>
            <button
              onClick={() => console.log('stop')}
              style={{
                flex: 1, background: '#fff', color: '#374151',
                border: '1px solid #d1d5db',
                padding: '10px 0', borderRadius: 8,
                fontSize: 14, cursor: 'pointer',
              }}
            >
              ⏹ Stop Camera
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, color: '#9ca3af', fontSize: 14 }}>
        💡 Position your face in the frame and ensure good lighting.
      </div>
    </PageLayout>
  );
};

export default Detection;