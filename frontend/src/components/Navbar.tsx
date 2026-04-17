import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'History', path: '/history' },
    { label: 'Dashboard', path: '/dashboard' },
  ];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: '#fff', borderBottom: '1px solid #e5e7eb',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', height: '56px',
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
        }} />
        <span style={{ fontWeight: 700, fontSize: 17, color: '#111827' }}>Mood Detector</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              textDecoration: 'none',
              color: location.pathname === item.path ? '#3b82f6' : '#6b7280',
              fontWeight: location.pathname === item.path ? 600 : 400,
              fontSize: 15,
            }}
          >
            {item.label}
          </Link>
        ))}
        <Link
          to="/login"
          style={{
            background: '#3b82f6', color: '#fff',
            padding: '8px 20px', borderRadius: 8,
            textDecoration: 'none', fontWeight: 600, fontSize: 14,
          }}
        >
          Login
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;