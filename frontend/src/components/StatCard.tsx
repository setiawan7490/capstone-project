import React from 'react';

interface Props {
  emoji: string;
  count: number | string;
  label: string;
  isBlue?: boolean;
}

const StatCard: React.FC<Props> = ({ emoji, count, label, isBlue }) => (
  <div className="card" style={{ flex: 1, minWidth: 0, padding: '18px 20px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
      {isBlue
        ? <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#60a5fa,#2563eb)', flexShrink: 0 }} />
        : <span style={{ fontSize: 22 }}>{emoji}</span>}
      <span style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' }}>{count}</span>
    </div>
    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</div>
  </div>
);

export default StatCard;