import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiLogin } from '../services/index';

const Login: React.FC = () => {
  const navigate      = useNavigate();
  const location      = useLocation();
  const { login }     = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  // Kembali ke halaman yang dituju, atau ke /dashboard
  const from = (location.state as { from?: string })?.from || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Email dan password wajib diisi.'); return; }
    setLoading(true); setError('');
    try {
      const res = await apiLogin(email, password);
      if (res.success && res.data) { login(res.data.token, res.data.user); navigate(from, { replace:true }); }
      else setError(res.message || 'Login gagal.');
    } catch { setError('Tidak bisa terhubung ke server.'); }
    setLoading(false);
  };

  const inp: React.CSSProperties = {
    width:'100%', padding:'11px 14px', border:'1px solid var(--border)', borderRadius:8,
    fontSize:14, background:'var(--bg-input)', color:'var(--text)', outline:'none', marginBottom:12,
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      {/* Theme toggle pojok kanan atas */}
      <button onClick={toggleTheme} style={{ position:'fixed', top:16, right:16, width:36, height:36, borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-card)', fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
        {theme==='light'?'🌙':'☀️'}
      </button>

      <div className="card" style={{ width:'100%', maxWidth:400, padding:'40px 32px' }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:48, marginBottom:8 }}>😄</div>
          <h2 style={{ fontSize:22, fontWeight:700, color:'var(--text)', marginBottom:4 }}>Selamat Datang</h2>
          <p style={{ color:'var(--text-2)', fontSize:14 }}>Masuk untuk menggunakan Mood Detector</p>
        </div>

        {error && <div style={{ padding:'10px 14px', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:8, color:'#dc2626', fontSize:14, marginBottom:16 }}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={{ fontSize:13, fontWeight:600, color:'var(--text-2)', display:'block', marginBottom:4 }}>Email</label>
          <input type="email" placeholder="email@contoh.com" value={email} onChange={e=>setEmail(e.target.value)} style={inp} />
          <label style={{ fontSize:13, fontWeight:600, color:'var(--text-2)', display:'block', marginBottom:4 }}>Password</label>
          <input type="password" placeholder="Min. 6 karakter" value={password} onChange={e=>setPassword(e.target.value)} style={{ ...inp, marginBottom:20 }} />
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width:'100%', justifyContent:'center', fontSize:15, padding:'12px' }}>
            {loading ? '⏳ Masuk...' : 'Masuk'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:20, fontSize:14, color:'var(--text-2)' }}>
          Belum punya akun? <Link to="/register" style={{ color:'var(--brand)', fontWeight:600 }}>Daftar sekarang</Link>
        </p>
        <p style={{ textAlign:'center', marginTop:8, fontSize:13 }}>
          <Link to="/" style={{ color:'var(--text-3)' }}>← Kembali ke halaman utama</Link>
        </p>
      </div>
    </div>
  );
};
export default Login;