import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const features = [
  { icon: '📷', title: 'Live Camera Detection', desc: 'Deteksi emosi wajah secara real-time menggunakan webcam kamu.' },
  { icon: '📂', title: 'Upload Foto', desc: 'Upload foto dari galeri untuk dianalisis emosinya.' },
  { icon: '📊', title: 'Statistik & History', desc: 'Pantau riwayat mood dan statistik emosi kamu dari waktu ke waktu.' },
  { icon: '💡', title: 'Rekomendasi Personal', desc: 'Dapatkan saran yang dipersonalisasi berdasarkan mood kamu.' },
];

const emotions = [
  { emoji: '😄', label: 'Happy' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😠', label: 'Angry' },
  { emoji: '😨', label: 'Fear' },
  { emoji: '😮', label: 'Surprise' },
  { emoji: '😐', label: 'Neutral' },
];

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleStart = () => {
    if (isAuthenticated) navigate('/dashboard');
    else navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'system-ui, sans-serif' }}>
      {/* Navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'var(--nav-bg)', borderBottom: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#60a5fa,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>😄</div>
            <span style={{ fontWeight: 700, fontSize: 16 }}>Mood Detector</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={toggleTheme} style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            {isAuthenticated
              ? <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ padding: '7px 16px', fontSize: 13 }}>Dashboard</button>
              : <>
                  <button onClick={() => navigate('/login')} className="btn btn-secondary" style={{ padding: '7px 14px', fontSize: 13 }}>Masuk</button>
                  <button onClick={() => navigate('/register')} className="btn btn-primary" style={{ padding: '7px 14px', fontSize: 13 }}>Daftar</button>
                </>
            }
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: 100, paddingBottom: 80, textAlign: 'center', background: 'var(--bg-hero)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎭</div>
          <h1 style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.2, marginBottom: 16, color: 'var(--text)' }}>
            Discover Your Mood<br />
            <span style={{ color: 'var(--brand)' }}>from Your Face</span>
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text-2)', marginBottom: 32, lineHeight: 1.6 }}>
            Deteksi emosi wajah kamu secara real-time menggunakan AI. Kenali perasaanmu dan dapatkan rekomendasi yang tepat.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={handleStart} className="btn btn-primary" style={{ fontSize: 16, padding: '13px 32px' }}>
              ▶ Mulai Sekarang
            </button>
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="btn btn-secondary" style={{ fontSize: 16, padding: '13px 28px' }}>
              Pelajari Lebih Lanjut
            </button>
          </div>

          {/* Emotion pills */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 40 }}>
            {emotions.map(e => (
              <div key={e.label} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '6px 14px', fontSize: 14 }}>
                <span style={{ fontSize: 20 }}>{e.emoji}</span>
                <span style={{ color: 'var(--text-2)' }}>{e.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '80px 20px', maxWidth: 1100, margin: '0 auto' }} id="features">
        <h2 style={{ fontSize: 30, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>Cara Kerja</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-2)', marginBottom: 48, fontSize: 16 }}>Cukup 3 langkah untuk mengetahui mood kamu</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }} className="grid-3-mobile">
          {[
            { step: '1', icon: '👤', title: 'Daftar / Masuk', desc: 'Buat akun gratis atau masuk dengan akun yang sudah ada.' },
            { step: '2', icon: '📷', title: 'Scan Wajah', desc: 'Gunakan kamera atau upload foto untuk dianalisis.' },
            { step: '3', icon: '📊', title: 'Lihat Hasil', desc: 'Dapatkan hasil emosi dan rekomendasi yang dipersonalisasi.' },
          ].map(s => (
            <div key={s.step} className="card" style={{ padding: 28, textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--brand)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, margin: '0 auto 16px' }}>{s.step}</div>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{s.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{s.title}</div>
              <div style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '0 20px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ fontSize: 30, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>Fitur Lengkap</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-2)', marginBottom: 48, fontSize: 16 }}>Semua yang kamu butuhkan dalam satu platform</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }} className="grid-2">
          {features.map(f => (
            <div key={f.title} className="card" style={{ padding: 24, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ fontSize: 36, flexShrink: 0 }}>{f.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{f.title}</div>
                <div style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--bg-hero)', padding: '60px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Siap Mengenal Mood Kamu?</h2>
        <p style={{ color: 'var(--text-2)', marginBottom: 28, fontSize: 16 }}>Gratis, tidak perlu kartu kredit.</p>
        <button onClick={handleStart} className="btn btn-primary" style={{ fontSize: 16, padding: '13px 36px' }}>
          {isAuthenticated ? '🏠 Ke Dashboard' : '✨ Daftar Gratis'}
        </button>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 20px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
        © 2025 Mood Detector · Dibuat dengan ❤️ untuk tugas capstone
      </footer>

      <style>{`
        @media(max-width:768px){.grid-3-mobile{grid-template-columns:1fr!important}}
      `}</style>
    </div>
  );
};

export default Landing;