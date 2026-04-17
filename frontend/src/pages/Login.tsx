import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';

const Login: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <div style={{ maxWidth: 400, margin: '60px auto' }}>
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb',
          borderRadius: 16, padding: '40px 32px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>😄</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
            Welcome Back
          </h2>
          <p style={{ color: '#6b7280', fontSize: 15, marginBottom: 28 }}>
            Sign in to access your Mood Detector
          </p>

          <input
            type="email"
            placeholder="Email address"
            style={{
              width: '100%', padding: '10px 14px',
              border: '1px solid #d1d5db', borderRadius: 8,
              fontSize: 14, marginBottom: 12, boxSizing: 'border-box',
              outline: 'none',
            }}
          />
          <input
            type="password"
            placeholder="Password"
            style={{
              width: '100%', padding: '10px 14px',
              border: '1px solid #d1d5db', borderRadius: 8,
              fontSize: 14, marginBottom: 20, boxSizing: 'border-box',
              outline: 'none',
            }}
          />

          <button
            onClick={() => navigate('/')}
            style={{
              width: '100%', background: '#3b82f6', color: '#fff',
              border: 'none', padding: '12px', borderRadius: 8,
              fontWeight: 600, fontSize: 15, cursor: 'pointer', marginBottom: 12,
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none', border: 'none',
              color: '#3b82f6', fontSize: 14, cursor: 'pointer',
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    </PageLayout>
  );
};

export default Login;