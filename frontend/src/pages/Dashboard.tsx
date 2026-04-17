import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts';
import PageLayout from '../components/PageLayout';
import SectionTitle from '../components/SectionTitle';
import StatCard from '../components/StatCard';
import { barChartData, weeklyTrendData } from '../services/mockData';

const Dashboard: React.FC = () => {
  return (
    <PageLayout>
      <SectionTitle title="Mood Dashboard" />

      {/* Stat Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <StatCard emoji="" count={305} label="Total Detections" isBlue />
        <StatCard emoji="😄" count={185} label="Happy" />
        <StatCard emoji="😢" count={72} label="Sad" />
        <StatCard emoji="😠" count={28} label="Angry" />
      </div>

      {/* Bar Chart */}
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb',
        borderRadius: 12, padding: '20px 24px', marginBottom: 20,
      }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: '#111827', marginBottom: 16 }}>
          Emotion Distribution (Last 7 Days)
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barChartData} barCategoryGap="30%">
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip />
            <Bar dataKey="thisWeek" name="This Week" radius={[4, 4, 0, 0]}>
              {barChartData.map((entry, index) => (
                <rect key={index} fill={entry.color} />
              ))}
            </Bar>
            <Bar dataKey="lastWeek" name="Last Week" radius={[4, 4, 0, 0]} fill="#d1d5db" />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 16, marginTop: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          {barChartData.map(d => (
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6b7280' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color }} />
              {d.name}
            </div>
          ))}
        </div>
      </div>

      {/* Line Chart */}
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb',
        borderRadius: 12, padding: '20px 24px', marginBottom: 20,
      }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: '#111827', marginBottom: 16 }}>
          Weekly Mood Trend
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={weeklyTrendData}>
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip />
            <Legend iconType="circle" iconSize={8} />
            <Line type="monotone" dataKey="happy" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4 }} name="Happy" />
            <Line type="monotone" dataKey="sad" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} name="Sad" />
            <Line type="monotone" dataKey="angry" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} name="Angry" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Today's Dominant Mood */}
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb',
        borderRadius: 12, padding: '20px 24px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ fontSize: 20 }}>🏆</span>
        <span style={{ fontWeight: 600, fontSize: 15, color: '#374151' }}>Today's Dominant Mood:</span>
        <span style={{ fontSize: 18 }}>😄</span>
        <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: 16 }}>
          Happy (62% of today's detections)
        </span>
      </div>
    </PageLayout>
  );
};

export default Dashboard;