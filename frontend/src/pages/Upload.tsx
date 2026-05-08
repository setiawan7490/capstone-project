import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import SectionTitle from '../components/SectionTitle';
import { apiDetectUpload } from '../services/index';
import { EmotionType } from '../types';
import { EMOTION_META } from '../utils/emotionMeta';

const Upload: React.FC = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file,      setFile]      = useState<File | null>(null);
  const [preview,   setPreview]   = useState<string | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [isDrag,    setIsDrag]    = useState(false);
  const [resultEmo, setResultEmo] = useState<EmotionType | null>(null);
  const [resultConf,setResultConf]= useState(0);
  const [entryId,   setEntryId]   = useState<string | null>(null);

  const handleFile = (f: File) => {
    if (!['image/jpeg','image/png','image/webp'].includes(f.type)) {
      setError('Format tidak didukung. Gunakan JPG, PNG, atau WEBP.'); return;
    }
    if (f.size > 5 * 1024 * 1024) { setError('Ukuran file maksimal 5MB.'); return; }
    setError(''); setFile(f); setResultEmo(null); setEntryId(null);
    setPreview(URL.createObjectURL(f));
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true); setError('');
    try {
      const res = await apiDetectUpload(file);
      if (res.success && res.data) {
        setResultEmo(res.data.detection.dominantEmotion as EmotionType);
        setResultConf(res.data.detection.dominantConfidence);
        setEntryId(res.data.entryId);
        // Auto navigate ke halaman result
        navigate(`/result/${res.data.entryId}`);
      } else {
        setError(res.message || 'Deteksi gagal, coba lagi.');
      }
    } catch {
      setError('Tidak bisa terhubung ke server. Pastikan backend berjalan.');
    }
    setLoading(false);
  };

  const handleReset = () => {
    setFile(null); setPreview(null); setResultEmo(null); setEntryId(null); setError('');
  };

  const meta = resultEmo ? EMOTION_META[resultEmo] : null;

  return (
    <PageLayout>
      <SectionTitle title="Upload Image Detection" />

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }} className="grid-2">
        {/* Drop Zone */}
        <div
          onDragOver={e=>{ e.preventDefault(); setIsDrag(true); }}
          onDragLeave={()=>setIsDrag(false)}
          onDrop={e=>{ e.preventDefault(); setIsDrag(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
          onClick={()=>inputRef.current?.click()}
          style={{ border:`2px dashed ${isDrag?'var(--brand)':'#93c5fd'}`, borderRadius:12,
            padding:'40px 24px', background:isDrag?'var(--bg-accent)':'var(--bg-hero)',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            minHeight:260, cursor:'pointer', transition:'all .2s' }}>
          <div style={{ fontSize:44, marginBottom:12 }}>📂</div>
          <div style={{ fontSize:15, color:'var(--text)', fontWeight:500, textAlign:'center', marginBottom:6 }}>
            Drag &amp; drop gambar di sini
          </div>
          <div style={{ fontSize:13, color:'var(--text-3)', textAlign:'center', marginBottom:16 }}>
            atau klik untuk browse — JPG, PNG, WEBP (maks 5MB)
          </div>
          {file && (
            <div style={{ fontSize:13, color:'var(--brand)', fontWeight:600 }}>✅ {file.name}</div>
          )}
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp"
            style={{ display:'none' }}
            onChange={e=>{ if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
        </div>

        {/* Preview */}
        <div className="card" style={{ minHeight:260, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
          {preview
            ? <img src={preview} alt="preview" style={{ width:'100%', maxHeight:300, objectFit:'contain' }} />
            : <div style={{ color:'var(--text-3)', fontSize:15 }}>Preview gambar muncul di sini</div>}
        </div>
      </div>

      {error && (
        <div style={{ padding:'10px 14px', background:'#fef2f2', border:'1px solid #fecaca',
          borderRadius:8, color:'#dc2626', fontSize:14, marginBottom:16 }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:20 }}>
        <button className="btn btn-primary" onClick={handleAnalyze} disabled={!file || loading}>
          {loading ? '⏳ Menganalisis dengan AI...' : '🔍 Analyze Image'}
        </button>
        <button className="btn btn-secondary" onClick={handleReset} disabled={loading}>
          Reset
        </button>
        {entryId && (
          <button className="btn btn-secondary" onClick={()=>navigate(`/result/${entryId}`)}>
            📊 Lihat Hasil Lengkap
          </button>
        )}
      </div>

      {/* Quick result preview */}
      {resultEmo && meta && (
        <div className="card" style={{ padding:'18px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:50, height:50, borderRadius:'50%', background:'var(--bg-accent)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>
              {meta.emoji}
            </div>
            <div>
              <div style={{ fontSize:20, fontWeight:700, color:'var(--text)' }}>{resultEmo}</div>
              <div style={{ fontSize:13, color:'var(--text-3)' }}>Detected Emotion</div>
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:26, fontWeight:800, color:'var(--brand)' }}>{resultConf.toFixed(1)}%</div>
            <div style={{ fontSize:13, color:'var(--text-3)' }}>Confidence Score</div>
          </div>
        </div>
      )}

      <p style={{ marginTop:16, fontSize:13, color:'var(--text-3)' }}>
        💡 Upload foto wajah yang jelas dan pencahayaan cukup untuk hasil terbaik.
        Setelah analisis, kamu akan otomatis diarahkan ke halaman hasil.
      </p>
    </PageLayout>
  );
};

export default Upload;