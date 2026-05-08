import React from 'react';
import Navbar from './Navbar';
const PageLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ minHeight:'100vh',background:'var(--bg)',color:'var(--text)' }}>
    <Navbar />
    <div style={{ paddingTop:56 }}>
      <div style={{ maxWidth:1200,margin:'0 auto',padding:'28px 16px' }}>{children}</div>
    </div>
  </div>
);
export default PageLayout;