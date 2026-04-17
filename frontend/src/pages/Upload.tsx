import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import SectionTitle from '../components/SectionTitle';

const Upload: React.FC = () => {
  const navigate = useNavigate();
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <PageLayout>
      <SectionTitle title="Upload Image Detection" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>
        {/* Upload Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragOver(false); }}
          style={{
            border: `2px dashed ${isDragOver ? '#2563eb' : '#93c5fd'}`,
            borderRadius: 12, padding: '40px 24px',
            background: isDragOver ? '#dbeafe' : '#eff6ff',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            minHeight: 280, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
          <div style={{ fontSize: 16, color: '#374151', fontWeight: 500, textAlign: 'center', marginBottom: 6 }}>
            Drag &amp; drop your image here
          </div>
          <div style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 20 }}>
            or click to browse — JPG, PNG, WEBP (max 5MB)
          </div>
          <button
            style={{
              background: '#3b82f6', color: '#fff', border: 'none',
              padding: '10px 28px', borderRadius: 8, fontWeight: 600,
              fontSize: 14, cursor: 'pointer',
            }}
          >
            Browse Files
          </button>
        </div>

        {/* Preview */}
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb',
          borderRadius: 12, overflow: 'hidden',
          minHeight: 280, display: 'flex', alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            width: '100%', height: '100%', background: '#d1d5db',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#6b7280', fontSize: 15, minHeight: 280,
          }}>
            Image Preview
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
        <button
          onClick={() => navigate('/result')}
          style={{
            background: '#3b82f6', color: '#fff', border: 'none',
            padding: '10px 28px', borderRadius: 8, fontWeight: 600,
            fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          🔍 Analyze Image
        </button>
        <button
          onClick={() => console.log('reset')}
          style={{
            background: '#fff', color: '#374151',
            border: '1px solid #d1d5db',
            padding: '10px 20px', borderRadius: 8,
            fontSize: 14, cursor: 'pointer',
          }}
        >
          Reset
        </button>
      </div>

      {/* Analysis Result */}
      <div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Analysis Result</h3>
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb',
          borderRadius: 12, padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: '#dbeafe', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 26,
            }}>
              😄
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>Happy</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>Detected Emotion</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#3b82f6' }}>98.2%</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>Confidence Score</div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Upload;