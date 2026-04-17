import React from 'react';

interface StatCardProps {
  emoji: string;
  count: number | string;
  label: string;
  isBlue?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ emoji, count, label, isBlue }) => (
  <div style={{
    background: '#fff', border: '1px solid #e5e7eb',
    borderRadius: 12, padding: '20px 24px', flex: 1,
    minWidth: 0,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
      {isBlue
        ? <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #60a5fa, #2563eb)', flexShrink: 0 }} />
        : <span style={{ fontSize: 24 }}>{emoji}</span>
      }
      <span style={{ fontSize: 28, fontWeight: 700, color: '#111827' }}>{count}</span>
    </div>
    <div style={{ fontSize: 14, color: '#6b7280' }}>{label}</div>
  </div>
);

export default StatCard;