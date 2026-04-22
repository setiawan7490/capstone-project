import React from 'react';

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ marginBottom: 20 }}>
    <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{title}</h2>
    <div style={{ height: 3, width: 48, background: 'var(--brand)', borderRadius: 2, marginTop: 6 }} />
  </div>
);

export default SectionTitle;