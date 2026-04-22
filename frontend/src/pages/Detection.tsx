import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import SectionTitle from '../components/SectionTitle';
import EmotionBar from '../components/EmotionBar';
import { detectFromCamera } from '../services';
import { EmotionScore, EmotionType } from '../types';
import { EMOTION_META } from '../utils/emotionMeta';

const Detection: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState('');
  const [dominantEmotion, setDominantEmotion] = useState<EmotionType | null>(null);
  const [dominantConfidence, setDominantConfidence] = useState(0);
  const [allEmotions, setAllEmotions] = useState<EmotionScore[]>([]);
  const [lastEntryId, setLastEntryId] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);

  const startCamera = useCallback(async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsRunning(true);

      // Deteksi otomatis setiap 3 detik
      intervalRef.current = setInterval(async () => {
        if (detecting) return;
        setDetecting(true);
        try {
          const res = await detectFromCamera();
          if (res.success && res.data) {
            const { detection, entryId } = res.data;
            setDominantEmotion(detection.dominantEmotion as EmotionType);
            setDominantConfidence(detection.dominantConfidence);
            setAllEmotions(detection.allEmotions as EmotionScore[]);
            setLastEntryId(entryId);
          }
        } finally {
          setDetecting(false);
        }
      }, 3000);
    } catch (e) {
      setError('Kamera tidak bisa diakses. Pastikan izin kamera sudah diberikan di browser.');
    }
  }, [detecting]);

  const stopCamera = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsRunning(false);
  }, []);

  const captureResult = () => {
    if (lastEntryId) navigate(`/result/${lastEntryId}`);
  };

  useEffect(() => () => stopCamera(), [stopCamera]);

  const meta = dominantEmotion ? EMOTION_META[dominantEmotion] : null;

  return (
    <PageLayout>
      <SectionTitle title="Live Camera Detection" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }} className="grid-2">
        {/* Camera */}
        <div style={{ background: 'var(--bg-camera)', borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
          <video
            ref={videoRef}
            muted
            playsInline
            style={{ width: '100%', minHeight: 340, objectFit: 'cover', display: isRunning ? 'block' : 'none' }}
          />
          {!isRunning && (
            <div style={{
              minHeight: 340, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 12,
            }}>
              <div style={{ fontSize: 48 }}>📷</div>
              <div style={{ color: '#6b7280', fontSize: 15 }}>Kamera belum aktif</div>
            </div>
          )}
          {isRunning && dominantEmotion && (
            <div style={{
              position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.7)', color: '#fff',
              padding: '6px 16px', borderRadius: 20, fontSize: 14, whiteSpace: 'nowrap',
            }}>
              {meta?.emoji} {dominantEmotion} — {dominantConfidence.toFixed(1)}%
              {detecting && <span style={{ marginLeft: 8, opacity: 0.7 }}>⟳</span>}
            </div>
          )}
        </div>

        {/* Result Panel */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Detection Result</h3>

          {dominantEmotion && meta ? (
            <>
              <div style={{
                background: 'var(--bg-accent)', borderRadius: 10,
                padding: '20px 16px', textAlign: 'center', marginBottom: 16,
              }}>
                <div style={{ fontSize: 40, marginBottom: 6 }}>{meta.emoji}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>{dominantEmotion}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Confidence: {dominantConfidence.toFixed(1)}%</div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>All Emotions Detected</div>
                {allEmotions.slice(0, 4).map(e => (
                  <EmotionBar
                    key={e.emotion}
                    emoji={EMOTION_META[e.emotion as EmotionType]?.emoji || ''}
                    label={e.emotion}
                    value={e.confidence}
                    color={EMOTION_META[e.emotion as EmotionType]?.color}
                  />
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: 14 }}>
              Aktifkan kamera untuk mulai deteksi
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {!isRunning ? (
              <button className="btn-primary" style={{ justifyContent: 'center' }} onClick={startCamera}>
                📷 Mulai Kamera
              </button>
            ) : (
              <>
                <button
                  className="btn-primary"
                  style={{ justifyContent: 'center' }}
                  onClick={captureResult}
                  disabled={!lastEntryId}
                >
                  📸 Capture Result
                </button>
                <button className="btn-secondary" style={{ justifyContent: 'center' }} onClick={stopCamera}>
                  ⏹ Stop Camera
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          marginTop: 16, padding: '12px 16px',
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 8, color: '#dc2626', fontSize: 14,
        }}>⚠️ {error}</div>
      )}

      <div style={{ marginTop: 14, color: 'var(--text-muted)', fontSize: 13 }}>
        💡 Posisikan wajah di tengah frame dan pastikan pencahayaan cukup.
        {isRunning && <span style={{ marginLeft: 6, color: 'var(--success)' }}>● Mendeteksi otomatis setiap 3 detik</span>}
      </div>
    </PageLayout>
  );
};

export default Detection;