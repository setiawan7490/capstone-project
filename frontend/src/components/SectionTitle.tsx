import React from 'react';

interface SectionTitleProps {
  title: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title }) => (
  <div style={{ marginBottom: 20 }}>
    <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>{title}</h2>
    <div style={{ height: 3, width: 48, background: '#3b82f6', borderRadius: 2, marginTop: 6 }} />
  </div>
);

export default SectionTitle;