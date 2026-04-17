import React from 'react';
import { useNavigate } from 'react-router-dom';
import { type MoodEntry } from '../types/index';

interface MoodHistoryItemProps {
  entry: MoodEntry;
  showDate?: boolean;
}

const MoodHistoryItem: React.FC<MoodHistoryItemProps> = ({ entry, showDate = true }) => {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 16px', background: '#fff',
      border: '1px solid #e5e7eb', borderRadius: 10, marginBottom: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, flexShrink: 0,
        }}>
          {entry.emoji}
        </div>
        <div>
          {showDate && (
            <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 2 }}>
              {entry.date} • {entry.time}
            </div>
          )}
          <div style={{ fontWeight: 600, fontSize: 15, color: '#111827' }}>{entry.emotion}</div>
        </div>
      </div>
      <button
        onClick={() => navigate('/recommendation')}
        style={{
          padding: '6px 14px', border: '1px solid #d1d5db',
          borderRadius: 6, background: '#fff', color: '#374151',
          fontSize: 13, cursor: 'pointer',
        }}
      >
        View More
      </button>
    </div>
  );
};

export default MoodHistoryItem;