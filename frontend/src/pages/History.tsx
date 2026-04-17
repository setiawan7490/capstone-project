import React, { useState } from 'react';
import PageLayout from '../components/PageLayout';
import SectionTitle from '../components/SectionTitle';
import MoodHistoryItem from '../components/MoodHistory';
import { moodHistory } from '../services/mockData';

const tabs = ['Today', 'This Week', 'This Month', 'All Time'];

const History: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Today');

  return (
    <PageLayout>
      <SectionTitle title="Mood History" />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 20px', borderRadius: 8,
              border: '1px solid #d1d5db',
              background: activeTab === tab ? '#3b82f6' : '#fff',
              color: activeTab === tab ? '#fff' : '#374151',
              fontWeight: activeTab === tab ? 600 : 400,
              fontSize: 14, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* History List */}
      <div>
        {moodHistory.map(entry => (
          <MoodHistoryItem key={entry.id} entry={entry} showDate />
        ))}
      </div>
    </PageLayout>
  );
};

export default History;