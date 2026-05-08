import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MoodEntry } from '../types';
import { EMOTION_META } from '../utils/emotionMeta';

interface Props {
  entry: MoodEntry;
  onDelete?: (id: string) => void;
}

const MoodHistoryItem: React.FC<Props> = ({ entry, onDelete }) => {
  const navigate = useNavigate();
  const meta = EMOTION_META[entry.dominantEmotion];
  const date = new Date(entry.detectedAt);
  const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="card" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px', marginBottom: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'var(--bg-accent)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
        }}>{meta.emoji}</div>
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 2 }}>
            {dateStr} • {timeStr}
            <span style={{
              marginLeft: 8, fontSize: 11, padding: '2px 6px',
              background: 'var(--bg-accent)', color: 'var(--brand)',
              borderRadius: 4, fontWeight: 600,
            }}>{entry.source}</span>
          </div>
          <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>
            {entry.dominantEmotion}
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 6 }}>
              {entry.dominantConfidence.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className="btn-secondary"
          style={{ padding: '5px 12px', fontSize: 12 }}
          onClick={() => navigate(`/result/${entry._id}`)}
        >View More</button>
        {onDelete && (
          <button
            style={{
              padding: '5px 10px', fontSize: 12, border: 'none',
              background: 'transparent', color: 'var(--danger)', cursor: 'pointer',
            }}
            onClick={() => onDelete(entry._id)}
          >✕</button>
        )}
      </div>
    </div>
  );
};

export default MoodHistoryItem;