import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Detection', path: '/detection' },
    { label: 'Upload', path: '/upload' },
    { label: 'History', path: '/history' },
    { label: 'Dashboard', path: '/dashboard' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      background: 'var(--nav-bg)', borderBottom: '1px solid var(--border)',
      boxShadow: 'var(--nav-shadow)',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 20px',
        height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>😄</div>
          <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>Mood Detector</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {navItems.map(item => (
            <Link key={item.path} to={item.path} style={{
              color: isActive(item.path) ? 'var(--brand)' : 'var(--text-secondary)',
              fontWeight: isActive(item.path) ? 600 : 400,
              fontSize: 14, transition: 'color 0.15s',
            }}>{item.label}</Link>
          ))}
        </div>

        {/* Right: theme toggle + login */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={toggleTheme}
            style={{
              width: 36, height: 36, borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          <Link to="/login" className="hide-mobile" style={{
            background: 'var(--brand)', color: '#fff',
            padding: '7px 16px', borderRadius: 8, fontWeight: 600, fontSize: 13,
          }}>Login</Link>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{
              display: 'none', width: 36, height: 36, borderRadius: 8,
              border: '1px solid var(--border)', background: 'var(--bg-card)',
              color: 'var(--text-primary)', fontSize: 18,
              alignItems: 'center', justifyContent: 'center',
            }}
            className="show-mobile-flex"
          >☰</button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          borderTop: '1px solid var(--border)',
          background: 'var(--nav-bg)',
          padding: '12px 20px 16px',
        }}>
          {navItems.map(item => (
            <Link
              key={item.path} to={item.path}
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'block', padding: '10px 0',
                color: isActive(item.path) ? 'var(--brand)' : 'var(--text-primary)',
                fontWeight: isActive(item.path) ? 600 : 400,
                fontSize: 15, borderBottom: '1px solid var(--border)',
              }}
            >{item.label}</Link>
          ))}
          <Link to="/login" onClick={() => setMenuOpen(false)} style={{
            display: 'block', marginTop: 12,
            background: 'var(--brand)', color: '#fff',
            padding: '10px 16px', borderRadius: 8,
            fontWeight: 600, fontSize: 14, textAlign: 'center',
          }}>Login</Link>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .show-mobile-flex { display: flex !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;