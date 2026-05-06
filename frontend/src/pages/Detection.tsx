import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import SectionTitle from '../components/SectionTitle';
import EmotionBar from '../components/EmotionBar';
import { apiDetectCamera } from '../services/index';
import { EmotionScore, EmotionType } from '../types';
import { EMOTION_META } from '../utils/emotionMeta';

const Detection: React.FC = () => {
  const navigate  = useNavigate();
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isRunning,   setIsRunning]   = useState(false);
  const [detecting,   setDetecting]   = useState(false);
  const [scanActive,  setScanActive]  = useState(false);
  const [error,       setError]       = useState('');
  const [lastEntryId, setLastEntryId] = useState<string | null>(null);
  const [dominantEmo, setDominantEmo] = useState<EmotionType | null>(null);
  const [confidence,  setConfidence]  = useState(0);
  const [allEmotions, setAllEmotions] = useState<EmotionScore[]>([]);

  // Ambil frame dari video → base64
  const captureFrame = useCallback((): string | null => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c || v.readyState < 2) return null;
    c.width  = v.videoWidth  || 640;
    c.height = v.videoHeight || 480;
    c.getContext('2d')?.drawImage(v, 0, 0);
    return c.toDataURL('image/jpeg', 0.85).split(',')[1];
  }, []);

  // Kirim frame ke AI → simpan hasil
  const runDetection = useCallback(async () => {
    if (detecting) return;
    setDetecting(true);
    setScanActive(true);
    setError('');
    try {
      const frame = captureFrame();
      const res   = await apiDetectCamera(frame ?? undefined);
      if (res.success && res.data) {
        const { detection, entryId } = res.data;
        setDominantEmo(detection.dominantEmotion as EmotionType);
        setConfidence(detection.dominantConfidence);
        setAllEmotions(detection.allEmotions as EmotionScore[]);
        setLastEntryId(entryId);
      } else {
        setError(res.message || 'Deteksi gagal, coba lagi.');
      }
    } catch {
      setError('Tidak bisa terhubung ke server.');
    } finally {
      setDetecting(false);
      setTimeout(() => setScanActive(false), 600);
    }
  }, [detecting, captureFrame]);

  // Buka kamera
  const startCamera = useCallback(async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsRunning(true);
    } catch {
      setError('Kamera tidak bisa diakses. Klik ikon 🔒 di address bar lalu izinkan akses kamera.');
    }
  }, []);

  // Tutup kamera
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsRunning(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const meta = dominantEmo ? EMOTION_META[dominantEmo] : null;

  return (
    <PageLayout>
      <SectionTitle title="Live Camera Detection" />

      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:20, alignItems:'start' }} className="grid-2">

        {/* ── Video feed ── */}
        <div style={{ background:'var(--bg-camera)', borderRadius:14, overflow:'hidden', position:'relative', minHeight:360 }}>
          <video ref={videoRef} muted playsInline
            style={{ width:'100%', display:isRunning ? 'block' : 'none', objectFit:'cover' }} />
          <canvas ref={canvasRef} style={{ display:'none' }} />

          {/* Scan animasi */}
          {scanActive && (
            <div style={{ position:'absolute', inset:0, border:'3px solid #22c55e', borderRadius:14, pointerEvents:'none' }}>
              <div className="scan-line" />
            </div>
          )}

          {/* Label hasil di atas video */}
          {isRunning && dominantEmo && !scanActive && (
            <div style={{
              position:'absolute', bottom:14, left:'50%', transform:'translateX(-50%)',
              background:'rgba(0,0,0,.75)', color:'#fff',
              padding:'6px 18px', borderRadius:20, fontSize:14, whiteSpace:'nowrap',
            }}>
              {meta?.emoji} {dominantEmo} — {confidence.toFixed(1)}%
            </div>
          )}

          {/* Detecting indicator */}
          {detecting && (
            <div style={{
              position:'absolute', top:14, left:'50%', transform:'translateX(-50%)',
              background:'rgba(34,197,94,.9)', color:'#fff',
              padding:'5px 16px', borderRadius:20, fontSize:13, whiteSpace:'nowrap',
            }}>
              ⏳ AI sedang menganalisis...
            </div>
          )}

          {/* Idle */}
          {!isRunning && (
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12 }}>
              <div style={{ fontSize:56 }}>📷</div>
              <p style={{ color:'#6b7280', fontSize:15 }}>Kamera belum aktif</p>
            </div>
          )}
        </div>

        {/* ── Panel kanan ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

          {/* Hasil deteksi */}
          <div className="card" style={{ padding:20 }}>
            <div style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>Hasil Deteksi</div>

            {dominantEmo && meta ? (
              <>
                <div style={{ background:'var(--bg-accent)', borderRadius:10, padding:'16px', textAlign:'center', marginBottom:12 }}>
                  <div style={{ fontSize:44, marginBottom:4 }}>{meta.emoji}</div>
                  <div style={{ fontSize:22, fontWeight:800, color:'var(--text)' }}>{dominantEmo}</div>
                  <div style={{ fontSize:13, color:'var(--text-3)', marginTop:2 }}>{confidence.toFixed(1)}% confidence</div>
                </div>
                {allEmotions.map(e => (
                  <EmotionBar key={e.emotion}
                    emoji={EMOTION_META[e.emotion as EmotionType]?.emoji || ''}
                    label={e.emotion}
                    value={e.confidence}
                    color={EMOTION_META[e.emotion as EmotionType]?.color} />
                ))}
              </>
            ) : (
              <div style={{ textAlign:'center', padding:'24px 0', color:'var(--text-3)', fontSize:14 }}>
                {isRunning ? 'Klik Scan untuk mendeteksi emosi' : 'Buka kamera terlebih dahulu'}
              </div>
            )}
          </div>

          {/* Tombol aksi */}
          {!isRunning ? (
            <button className="btn btn-primary" style={{ justifyContent:'center', padding:'13px', fontSize:15 }} onClick={startCamera}>
              📷 Buka Kamera
            </button>
          ) : (
            <>
              <button className="btn btn-primary"
                style={{ justifyContent:'center', padding:'13px', fontSize:16 }}
                onClick={runDetection} disabled={detecting}>
                {detecting ? '⏳ Menganalisis...' : '📸 Scan Wajah'}
              </button>

              {lastEntryId && (
                <button className="btn btn-secondary"
                  style={{ justifyContent:'center', padding:'11px' }}
                  onClick={() => navigate(`/result/${lastEntryId}`)}>
                  ✅ Lihat Hasil Lengkap
                </button>
              )}

              <button className="btn btn-secondary"
                style={{ justifyContent:'center', padding:'11px' }}
                onClick={stopCamera}>
                ⏹ Stop Kamera
              </button>
            </>
          )}

          {/* Info */}
          <p style={{ fontSize:12, color:'var(--text-3)', textAlign:'center', lineHeight:1.6 }}>
            💡 Posisikan wajah di tengah kamera, pencahayaan cukup, lalu klik <strong>Scan Wajah</strong>.
            Hasil dianalisis oleh AI secara langsung.
          </p>
        </div>
      </div>

      {error && (
        <div style={{ marginTop:16, padding:'12px 16px', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:8, color:'#dc2626', fontSize:14 }}>
          ⚠️ {error}
        </div>
      )}
    </PageLayout>
  );
};

export default Detection;