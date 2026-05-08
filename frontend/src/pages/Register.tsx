import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiRegister } from '../services/index';

const Register: React.FC = () => {
  const navigate  = useNavigate();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name||!email||!password) { setError('Semua field wajib diisi.'); return; }
    if (password.length < 6)      { setError('Password minimal 6 karakter.'); return; }
    if (password !== confirm)      { setError('Konfirmasi password tidak cocok.'); return; }
    setLoading(true); setError('');
    try {
      const res = await apiRegister(name, email, password);
      if (res.success && res.data) { login(res.data.token, res.data.user); navigate('/dashboard', { replace:true }); }
      else setError(res.message || 'Registrasi gagal.');
    } catch { setError('Tidak bisa terhubung ke server.'); }
    setLoading(false);
  };

  const inp: React.CSSProperties = {
    width:'100%', padding:'11px 14px', border:'1px solid var(--border)', borderRadius:8,
    fontSize:14, background:'var(--bg-input)', color:'var(--text)', outline:'none', marginBottom:12,
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <button onClick={toggleTheme} style={{ position:'fixed', top:16, right:16, width:36, height:36, borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-card)', fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
        {theme==='light'?'🌙':'☀️'}
      </button>

      <div className="card" style={{ width:'100%', maxWidth:420, padding:'40px 32px' }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:48, marginBottom:8 }}>✨</div>
          <h2 style={{ fontSize:22, fontWeight:700, color:'var(--text)', marginBottom:4 }}>Buat Akun Baru</h2>
          <p style={{ color:'var(--text-2)', fontSize:14 }}>Gratis selamanya, tidak perlu kartu kredit</p>
        </div>

        {error && <div style={{ padding:'10px 14px', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:8, color:'#dc2626', fontSize:14, marginBottom:16 }}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          {[
            { label:'Nama Lengkap', type:'text',     val:name,     set:setName,     ph:'Nama kamu' },
            { label:'Email',        type:'email',    val:email,    set:setEmail,    ph:'email@contoh.com' },
            { label:'Password',     type:'password', val:password, set:setPassword, ph:'Min. 6 karakter' },
            { label:'Konfirmasi Password', type:'password', val:confirm, set:setConfirm, ph:'Ulangi password' },
          ].map((f,i,arr) => (
            <div key={f.label}>
              <label style={{ fontSize:13, fontWeight:600, color:'var(--text-2)', display:'block', marginBottom:4 }}>{f.label}</label>
              <input type={f.type} placeholder={f.ph} value={f.val} onChange={e=>f.set(e.target.value)}
                style={{ ...inp, marginBottom: i===arr.length-1?20:12 }} />
            </div>
          ))}
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width:'100%', justifyContent:'center', fontSize:15, padding:'12px' }}>
            {loading ? '⏳ Mendaftar...' : '✨ Daftar Sekarang'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:20, fontSize:14, color:'var(--text-2)' }}>
          Sudah punya akun? <Link to="/login" style={{ color:'var(--brand)', fontWeight:600 }}>Masuk</Link>
        </p>
        <p style={{ textAlign:'center', marginTop:8, fontSize:13 }}>
          <Link to="/" style={{ color:'var(--text-3)' }}>← Kembali ke halaman utama</Link>
        </p>
      </div>
    </div>
  );
};
export default Register;