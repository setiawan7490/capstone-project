import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import SectionTitle from '../components/SectionTitle';

const recommendations = [
  { icon: '🌿', text: 'Take a short break and step outside for some fresh air.' },
  { icon: '🎵', text: 'Listen to uplifting music or your favorite playlist.' },
  { icon: '🫁', text: 'Try breathing exercises: inhale 4s, hold 4s, exhale 4s.' },
  { icon: '☕', text: 'Make a warm drink and give yourself 10 quiet minutes.' },
];

const Recommendation: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <SectionTitle title="Mood Recommendation" />

      {/* Detected Mood Card */}
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb',
        borderRadius: 12, padding: '20px 24px', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          background: '#dbeafe', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 30,
          flexShrink: 0,
        }}>
          😢
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
            You seem Sad today
          </div>
          <div style={{ fontSize: 14, color: '#9ca3af' }}>
            Detected at 09:15 AM • Confidence: 89.4%
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb',
        borderRadius: 12, padding: '20px 24px', marginBottom: 20,
      }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          💡 Recommendation for You
        </div>
        {recommendations.map((rec, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            marginBottom: i < recommendations.length - 1 ? 14 : 0,
          }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{rec.icon}</span>
            <span style={{ fontSize: 15, color: '#374151', lineHeight: 1.5 }}>{rec.text}</span>
          </div>
        ))}
      </div>

      {/* Motivational Quote */}
      <div style={{
        background: '#dbeafe', borderRadius: 12,
        padding: '20px 24px', marginBottom: 40,
      }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#2563eb', marginBottom: 8 }}>
          "It's okay to not feel okay. Take it one step at a time. 💙"
        </div>
        <div style={{ fontSize: 14, color: '#6b7280' }}>
          Mood Detector cares about your wellbeing.
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button
          onClick={() => navigate('/detection')}
          style={{
            background: '#3b82f6', color: '#fff', border: 'none',
            padding: '10px 24px', borderRadius: 8, fontWeight: 600,
            fontSize: 14, cursor: 'pointer',
          }}
        >
          📸 Detect Again
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: '#fff', color: '#374151',
            border: '1px solid #d1d5db',
            padding: '10px 20px', borderRadius: 8,
            fontSize: 14, cursor: 'pointer',
          }}
        >
          📊 View Dashboard
        </button>
        <button
          onClick={() => navigate('/history')}
          style={{
            background: '#fff', color: '#374151',
            border: '1px solid #d1d5db',
            padding: '10px 20px', borderRadius: 8,
            fontSize: 14, cursor: 'pointer',
          }}
        >
          📋 View History
        </button>
      </div>
    </PageLayout>
  );
};

export default Recommendation;