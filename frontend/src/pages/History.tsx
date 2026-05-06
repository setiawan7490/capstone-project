import React, { useState, useEffect, useCallback } from 'react';
import PageLayout from '../components/PageLayout';
import SectionTitle from '../components/SectionTitle';
import { useNavigate } from 'react-router-dom';
import { apiGetHistory, apiDeleteHistory } from '../services/index';
import { MoodEntry, Pagination } from '../types';
import { EMOTION_META, formatTime } from '../utils/emotionMeta';
import { useWebSocket } from '../hooks/useWebSocket';

type Filter = 'today'|'week'|'month'|'all';
const TABS: { label: string; value: Filter }[] = [
  { label:'Today', value:'today' },{ label:'This Week', value:'week' },
  { label:'This Month', value:'month' },{ label:'All Time', value:'all' },
];

const History: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('today');
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (f: Filter, p: number, append = false) => {
    setLoading(true);
    const res = await apiGetHistory({ filter:f, page:p, limit:10 });
    if (res.success && res.data) {
      setEntries(prev => append ? [...prev, ...res.data!.entries] : res.data!.entries);
      setPagination(res.data.pagination);
    }
    setLoading(false);
  }, []);

  useEffect(() => { setPage(1); setEntries([]); load(filter, 1); }, [filter, load]);

  useWebSocket({
    onDetection: () => { if (filter==='today'||filter==='all') load(filter,1); },
    onHistoryUpdate: ({ action, id }) => { if (action==='delete') setEntries(prev=>prev.filter(e=>e._id!==id)); },
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus riwayat ini?')) return;
    const res = await apiDeleteHistory(id);
    if (res.success) setEntries(prev=>prev.filter(e=>e._id!==id));
  };

  return (
    <PageLayout>
      <SectionTitle title="Mood History" />
      <div style={{ display:'flex',gap:8,marginBottom:20,flexWrap:'wrap' }}>
        {TABS.map(t => (
          <button key={t.value} onClick={()=>setFilter(t.value)} className="btn"
            style={{ padding:'8px 18px',background:filter===t.value?'var(--brand)':'var(--bg-card)',color:filter===t.value?'#fff':'var(--text)',border:'1px solid var(--border)',fontSize:14 }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && entries.length===0 ? (
        <div style={{ textAlign:'center',padding:40,color:'var(--text-3)' }}>⏳ Memuat...</div>
      ) : entries.length===0 ? (
        <div style={{ textAlign:'center',padding:40,color:'var(--text-3)' }}>
          Tidak ada data untuk filter ini.<br/>
          <button className="btn btn-primary" style={{ marginTop:12 }} onClick={()=>navigate('/detection')}>Mulai Deteksi</button>
        </div>
      ) : (
        <>
          {entries.map(e => {
            const meta = EMOTION_META[e.dominantEmotion];
            return (
              <div key={e._id} className="card" style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',marginBottom:8 }}>
                <div style={{ display:'flex',alignItems:'center',gap:12 }}>
                  <div style={{ width:40,height:40,borderRadius:'50%',background:'var(--bg-accent)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0 }}>{meta.emoji}</div>
                  <div>
                    <div style={{ fontSize:13,color:'var(--text-3)' }}>{formatTime(e.detectedAt)} · {e.source}</div>
                    <div style={{ fontWeight:600,fontSize:15 }}>{e.dominantEmotion} <span style={{ fontSize:12,color:'var(--text-3)' }}>{e.dominantConfidence.toFixed(1)}%</span></div>
                  </div>
                </div>
                <div style={{ display:'flex',gap:8 }}>
                  <button className="btn btn-secondary" style={{ padding:'5px 12px',fontSize:12 }} onClick={()=>navigate(`/result/${e._id}`)}>View More</button>
                  <button onClick={()=>handleDelete(e._id)} style={{ padding:'5px 10px',border:'none',background:'transparent',color:'var(--danger)',cursor:'pointer',fontSize:16 }}>✕</button>
                </div>
              </div>
            );
          })}
          {pagination && page < pagination.totalPages && (
            <button className="btn btn-secondary" style={{ width:'100%',justifyContent:'center',marginTop:10 }}
              onClick={()=>{ const next=page+1; setPage(next); load(filter,next,true); }} disabled={loading}>
              {loading?'Memuat...':'Load More'}
            </button>
          )}
          {pagination && <div style={{ textAlign:'center',marginTop:10,fontSize:13,color:'var(--text-3)' }}>Menampilkan {entries.length} dari {pagination.total} entri</div>}
        </>
      )}
    </PageLayout>
  );
};
export default History;