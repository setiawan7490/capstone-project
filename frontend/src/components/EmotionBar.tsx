import React from 'react';

interface Props {
  label: string;
  emoji: string;
  value: number;
  color?: string;
}

const EmotionBar: React.FC<Props> = ({ label, emoji, value, color = 'var(--brand)' }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
      <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{emoji} {label}</span>
      <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>{value.toFixed(1)}%</span>
    </div>
    <div style={{ height: 7, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${Math.min(value, 100)}%`,
        background: color, borderRadius: 4,
        transition: 'width 0.5s ease',
      }} />
    </div>
  </div>
);

export default EmotionBar;