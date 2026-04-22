import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';

const Login: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <div style={{ maxWidth: 400, margin: '50px auto' }}>
        <div className="card" style={{ padding: '36px 28px', textAlign: 'center' }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>😄</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
            Sign in to access your Mood Detector
          </p>

          <input type="email" placeholder="Email address" style={{
            width: '100%', padding: '10px 14px',
            border: '1px solid var(--border)', borderRadius: 8,
            fontSize: 14, marginBottom: 10,
            background: 'var(--bg-input)', color: 'var(--text-primary)',
            outline: 'none',
          }} />
          <input type="password" placeholder="Password" style={{
            width: '100%', padding: '10px 14px',
            border: '1px solid var(--border)', borderRadius: 8,
            fontSize: 14, marginBottom: 20,
            background: 'var(--bg-input)', color: 'var(--text-primary)',
            outline: 'none',
          }} />

          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 10, fontSize: 15 }}
            onClick={() => navigate('/')}>
            Sign In
          </button>
          <button style={{ background: 'none', border: 'none', color: 'var(--brand)', fontSize: 14, cursor: 'pointer' }}
            onClick={() => navigate('/')}>
            Kembali ke Home
          </button>
        </div>
      </div>
    </PageLayout>
  );
};

export default Login;