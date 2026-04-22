import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import SectionTitle from '../components/SectionTitle';
import { detectFromUpload } from '../services';
import { MoodEntry } from '../types';
import { EMOTION_META } from '../utils/emotionMeta';

const Upload: React.FC = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<MoodEntry | null>(null);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDrag, setIsDrag] = useState(false);

  const handleFile = (f: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      setError('Format tidak didukung. Gunakan JPG, PNG, atau WEBP.');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('Ukuran file maks 5MB.');
      return;
    }
    setError('');
    setFile(f);
    setResult(null);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDrag(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const res = await detectFromUpload(file);
      if (res.success && res.data) {
        setResult(res.data.detection as unknown as MoodEntry);
        setEntryId(res.data.entryId);
      } else {
        setError(res.message || 'Deteksi gagal.');
      }
    } catch {
      setError('Gagal menghubungi server.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setEntryId(null);
    setError('');
  };

  const meta = result ? EMOTION_META[result.dominantEmotion] : null;

  return (
    <PageLayout>
      <SectionTitle title="Upload Image Detection" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }} className="grid-2">
        {/* Drop Zone */}
        <div
          onDragOver={e => { e.preventDefault(); setIsDrag(true); }}
          onDragLeave={() => setIsDrag(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${isDrag ? 'var(--brand)' : '#93c5fd'}`,
            borderRadius: 12, padding: '40px 24px',
            background: isDrag ? 'var(--bg-accent)' : 'var(--brand-light)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            minHeight: 260, cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: 44, marginBottom: 12 }}>📂</div>
          <div style={{ fontSize: 15, color: 'var(--text-primary)', fontWeight: 500, textAlign: 'center', marginBottom: 6 }}>
            Drag &amp; drop gambar di sini
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 16 }}>
            atau klik untuk browse — JPG, PNG, WEBP (maks 5MB)
          </div>
          <button className="btn-primary" onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}>
            Browse Files
          </button>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }}
            onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
        </div>

        {/* Preview */}
        <div className="card" style={{
          minHeight: 260, display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {preview ? (
            <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: 280 }} />
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: 15 }}>Image Preview</div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <button className="btn-primary" onClick={handleAnalyze} disabled={!file || loading}>
          {loading ? '⏳ Menganalisis...' : '🔍 Analyze Image'}
        </button>
        <button className="btn-secondary" onClick={handleReset}>Reset</button>
        {entryId && (
          <button className="btn-secondary" onClick={() => navigate(`/result/${entryId}`)}>
            📊 Lihat Hasil Lengkap
          </button>
        )}
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', fontSize: 14, marginBottom: 16 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Result */}
      {result && meta && (
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Analysis Result</h3>
          <div className="card" style={{
            padding: '18px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 50, height: 50, borderRadius: '50%',
                background: 'var(--bg-accent)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 26,
              }}>{meta.emoji}</div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{result.dominantEmotion}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Detected Emotion</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--brand)' }}>{result.dominantConfidence.toFixed(1)}%</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Confidence Score</div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default Upload;