import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const NAV_LINKS = [
  { label:'Dashboard', path:'/dashboard' },
  { label:'Detection',  path:'/detection' },
  { label:'Upload',     path:'/upload' },
  { label:'History',    path:'/history' },
];

const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [open, setOpen] = useState(false);
  const isActive = (p: string) => location.pathname === p;

  const handleLogout = () => { logout(); navigate('/'); setOpen(false); };

  return (
    <nav style={{ position:'fixed',top:0,left:0,right:0,zIndex:200,background:'var(--nav-bg)',borderBottom:'1px solid var(--border)',boxShadow:'var(--shadow)' }}>
      <div style={{ maxWidth:1200,margin:'0 auto',padding:'0 20px',height:56,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        {/* Logo */}
        <Link to="/" style={{ display:'flex',alignItems:'center',gap:8 }}>
          <div style={{ width:30,height:30,borderRadius:'50%',background:'linear-gradient(135deg,#60a5fa,#3b82f6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16 }}>😄</div>
          <span style={{ fontWeight:700,fontSize:16,color:'var(--text)' }}>Mood Detector</span>
        </Link>

        {/* Desktop links — only if logged in */}
        {isAuthenticated && (
          <div className="hide-mobile" style={{ display:'flex',alignItems:'center',gap:22 }}>
            {NAV_LINKS.map(l => (
              <Link key={l.path} to={l.path} style={{ color:isActive(l.path)?'var(--brand)':'var(--text-2)',fontWeight:isActive(l.path)?600:400,fontSize:14,transition:'color .15s' }}>
                {l.label}
              </Link>
            ))}
          </div>
        )}

        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
          <button onClick={toggleTheme} title="Toggle theme" style={{ width:36,height:36,borderRadius:8,border:'1px solid var(--border)',background:'var(--bg-card)',color:'var(--text)',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer' }}>
            {theme==='light'?'🌙':'☀️'}
          </button>
          {isAuthenticated ? (
            <div className="hide-mobile" style={{ display:'flex',alignItems:'center',gap:8 }}>
              <span style={{ fontSize:13,color:'var(--text-2)' }}>Hi, {user?.name.split(' ')[0]}</span>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding:'6px 12px',fontSize:13 }}>Logout</button>
            </div>
          ) : (
            <div className="hide-mobile" style={{ display:'flex',gap:8 }}>
              <Link to="/login"    className="btn btn-secondary" style={{ padding:'6px 12px',fontSize:13 }}>Masuk</Link>
              <Link to="/register" className="btn btn-primary"   style={{ padding:'6px 12px',fontSize:13 }}>Daftar</Link>
            </div>
          )}
          {/* Hamburger */}
          <button onClick={()=>setOpen(o=>!o)} className="show-mobile-flex"
            style={{ display:'none',width:36,height:36,borderRadius:8,border:'1px solid var(--border)',background:'var(--bg-card)',color:'var(--text)',fontSize:18,alignItems:'center',justifyContent:'center',cursor:'pointer' }}>
            {open?'✕':'☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ borderTop:'1px solid var(--border)',background:'var(--nav-bg)',padding:'12px 20px 16px' }}>
          {isAuthenticated && NAV_LINKS.map(l => (
            <Link key={l.path} to={l.path} onClick={()=>setOpen(false)}
              style={{ display:'block',padding:'10px 0',color:isActive(l.path)?'var(--brand)':'var(--text)',borderBottom:'1px solid var(--border)',fontSize:15,fontWeight:isActive(l.path)?600:400 }}>
              {l.label}
            </Link>
          ))}
          {isAuthenticated
            ? <button onClick={handleLogout} style={{ marginTop:12,width:'100%',padding:'10px',borderRadius:8,background:'var(--danger)',color:'#fff',border:'none',fontSize:14,fontWeight:600,cursor:'pointer' }}>Logout</button>
            : <div style={{ display:'flex',flexDirection:'column',gap:8,marginTop:12 }}>
                <Link to="/login"    onClick={()=>setOpen(false)} className="btn btn-secondary" style={{ justifyContent:'center' }}>Masuk</Link>
                <Link to="/register" onClick={()=>setOpen(false)} className="btn btn-primary"   style={{ justifyContent:'center' }}>Daftar Gratis</Link>
              </div>
          }
        </div>
      )}
      <style>{`@media(max-width:768px){.hide-mobile{display:none!important}.show-mobile-flex{display:flex!important}}`}</style>
    </nav>
  );
};
export default Navbar;