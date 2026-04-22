import React from 'react';
import Navbar from './Navbar';

interface Props { children: React.ReactNode; }

const PageLayout: React.FC<Props> = ({ children }) => (
  <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-primary)' }}>
    <Navbar />
    <div style={{ paddingTop: 56 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 16px' }}>
        {children}
      </div>
    </div>
  </div>
);

export default PageLayout;