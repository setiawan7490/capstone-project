import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Jika belum login → tampilkan modal/prompt login, bukan redirect paksa.
 * User bisa lihat landing page, tapi saat klik fitur muncul prompt.
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div className="card" style={{ maxWidth: 420, width: '100%', padding: '40px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔒</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
            Login Diperlukan
          </h2>
          <p style={{ color: 'var(--text-2)', fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
            Untuk menggunakan fitur ini, kamu perlu login atau daftar akun terlebih dahulu.
            <br />Data mood kamu akan tersimpan dengan aman.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              className="btn btn-primary"
              style={{ justifyContent: 'center', fontSize: 15, padding: '12px' }}
              onClick={() => navigate('/login', { state: { from: location.pathname } })}
            >
              Masuk ke Akun
            </button>
            <button
              className="btn btn-secondary"
              style={{ justifyContent: 'center', fontSize: 15, padding: '12px' }}
              onClick={() => navigate('/register', { state: { from: location.pathname } })}
            >
              ✨ Daftar Gratis
            </button>
            <button
              style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontSize: 13, cursor: 'pointer', marginTop: 4 }}
              onClick={() => navigate('/')}
            >
              ← Kembali ke Halaman Utama
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;