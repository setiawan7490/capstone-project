import React, { useState, useEffect, useCallback } from 'react';
import PageLayout from '../components/PageLayout';
import SectionTitle from '../components/SectionTitle';
import MoodHistoryItem from '../components/MoodHistoryItem';
import { fetchHistory, deleteHistoryEntry } from '../services';
import { MoodEntry, Pagination } from '../types';
import { useWebSocket } from '../hooks/useWebSocket';

type Filter = 'today' | 'week' | 'month' | 'all';
const TABS: { label: string; value: Filter }[] = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'All Time', value: 'all' },
];

const History: React.FC = () => {
  const [filter, setFilter] = useState<Filter>('today');
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (f: Filter, p: number) => {
    setLoading(true);
    const res = await fetchHistory({ filter: f, page: p, limit: 10 });
    if (res.success && res.data) {
      setEntries(p === 1 ? res.data.entries : prev => [...prev, ...res.data!.entries]);
      setPagination(res.data.pagination);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    setPage(1);
    setEntries([]);
    load(filter, 1);
  }, [filter, load]);

  // Realtime: refresh saat ada deteksi baru
  useWebSocket({
    onDetection: () => {
      if (filter === 'today' || filter === 'all') load(filter, 1);
    },
    onHistoryUpdate: ({ action, id }) => {
      if (action === 'delete') setEntries(prev => prev.filter(e => e._id !== id));
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus entri ini?')) return;
    const res = await deleteHistoryEntry(id);
    if (res.success) setEntries(prev => prev.filter(e => e._id !== id));
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    load(filter, next);
  };

  return (
    <PageLayout>
      <SectionTitle title="Mood History" />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.value} onClick={() => setFilter(t.value)} style={{
            padding: '8px 18px', borderRadius: 8,
            border: '1px solid var(--border)',
            background: filter === t.value ? 'var(--brand)' : 'var(--bg-card)',
            color: filter === t.value ? '#fff' : 'var(--text-primary)',
            fontWeight: filter === t.value ? 600 : 400,
            fontSize: 14, cursor: 'pointer', transition: 'all 0.15s',
          }}>{t.label}</button>
        ))}
      </div>

      {loading && entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Memuat...</div>
      ) : entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Tidak ada data untuk filter ini.</div>
      ) : (
        <>
          {entries.map(e => (
            <MoodHistoryItem key={e._id} entry={e} onDelete={handleDelete} />
          ))}
          {pagination && page < pagination.totalPages && (
            <button
              className="btn-secondary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}
              onClick={loadMore}
              disabled={loading}
            >
              {loading ? 'Memuat...' : 'Load More'}
            </button>
          )}
          {pagination && (
            <div style={{ textAlign: 'center', marginTop: 10, fontSize: 13, color: 'var(--text-muted)' }}>
              Menampilkan {entries.length} dari {pagination.total} entri
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
};

export default History;