import React, { useState, useEffect, useCallback } from 'react';
import PageLayout from '../components/PageLayout';
import SectionTitle from '../components/SectionTitle';
import { useNavigate } from 'react-router-dom';
import { apiGetHistory, apiDeleteHistory, apiBulkDeleteHistory } from '../services/index';
import { MoodEntry, Pagination } from '../types';
import { EMOTION_META, formatTime } from '../utils/emotionMeta';
import { useWebSocket } from '../hooks/useWebSocket';

type Filter = 'today'|'week'|'month'|'all';
const TABS: { label:string; value:Filter }[] = [
  { label:'Hari Ini', value:'today' },
  { label:'Minggu Ini', value:'week' },
  { label:'Bulan Ini', value:'month' },
  { label:'Semua', value:'all' },
];

const History: React.FC = () => {
  const navigate = useNavigate();
  const [filter,      setFilter]      = useState<Filter>('all');
  const [entries,     setEntries]     = useState<MoodEntry[]>([]);
  const [pagination,  setPagination]  = useState<Pagination|null>(null);
  const [page,        setPage]        = useState(1);
  const [loading,     setLoading]     = useState(true);

  // Multi-select state
  const [selectMode,  setSelectMode]  = useState(false);
  const [selected,    setSelected]    = useState<Set<string>>(new Set());

  // Bulk delete modal
  const [showBulk,    setShowBulk]    = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const load = useCallback(async (f: Filter, p: number, append=false) => {
    setLoading(true);
    const res = await apiGetHistory({ filter:f, page:p, limit:10 });
    if (res.success && res.data) {
      setEntries(prev => append ? [...prev, ...res.data!.entries] : res.data!.entries);
      setPagination(res.data.pagination);
    }
    setLoading(false);
  }, []);

  useEffect(() => { setPage(1); setEntries([]); setSelected(new Set()); setSelectMode(false); load(filter,1); }, [filter, load]);

  useWebSocket({
    onDetection: () => { if (filter==='today'||filter==='all') load(filter,1); },
    onHistoryUpdate: ({ action, id }) => {
      if (action==='delete') setEntries(prev=>prev.filter(e=>e._id!==id));
      if (action==='bulk_delete') load(filter,1);
    },
  });

  // Toggle pilih satu
  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  // Pilih semua yang ditampilkan
  const toggleAll = () => {
    if (selected.size === entries.length) setSelected(new Set());
    else setSelected(new Set(entries.map(e => e._id)));
  };

  // Hapus satu
  const handleDelete = async (id: string) => {
    if (!confirm('Hapus riwayat ini?')) return;
    const res = await apiDeleteHistory(id);
    if (res.success) setEntries(prev=>prev.filter(e=>e._id!==id));
  };

  // Hapus terpilih (ids)
  const handleDeleteSelected = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Hapus ${selected.size} riwayat yang dipilih?`)) return;
    setBulkLoading(true);
    const res = await apiBulkDeleteHistory('ids', Array.from(selected));
    if (res.success) {
      setEntries(prev=>prev.filter(e=>!selected.has(e._id)));
      setSelected(new Set());
      setSelectMode(false);
    }
    setBulkLoading(false);
  };

  // Bulk delete berdasarkan periode
  const handleBulkByPeriod = async (mode: 'all'|'today'|'week'|'month') => {
    const labels = { all:'semua', today:'hari ini', week:'minggu ini', month:'bulan ini' };
    if (!confirm(`Hapus semua riwayat ${labels[mode]}?`)) return;
    setBulkLoading(true);
    const res = await apiBulkDeleteHistory(mode);
    if (res.success) { load(filter,1); setShowBulk(false); }
    setBulkLoading(false);
  };

  return (
    <PageLayout>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10, marginBottom:6 }}>
        <SectionTitle title="Mood History" />
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-secondary" style={{ padding:'7px 14px', fontSize:13 }}
            onClick={() => { setSelectMode(s=>!s); setSelected(new Set()); }}>
            {selectMode ? '✕ Batal Pilih' : '☑ Pilih'}
          </button>
          <button className="btn btn-danger" style={{ padding:'7px 14px', fontSize:13, background:'#ef4444', color:'#fff', border:'none', borderRadius:8, cursor:'pointer' }}
            onClick={() => setShowBulk(true)}>
            🗑 Hapus Massal
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        {TABS.map(t => (
          <button key={t.value} onClick={()=>setFilter(t.value)} className="btn"
            style={{ padding:'7px 16px', background:filter===t.value?'var(--brand)':'var(--bg-card)',
              color:filter===t.value?'#fff':'var(--text)', border:'1px solid var(--border)', fontSize:13 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Select all bar */}
      {selectMode && entries.length > 0 && (
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', background:'var(--bg-accent)',
          borderRadius:8, marginBottom:12, flexWrap:'wrap' }}>
          <label style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', fontSize:14 }}>
            <input type="checkbox" checked={selected.size===entries.length && entries.length>0}
              onChange={toggleAll} style={{ width:16, height:16 }} />
            Pilih semua ({entries.length})
          </label>
          {selected.size > 0 && (
            <button className="btn" onClick={handleDeleteSelected} disabled={bulkLoading}
              style={{ padding:'6px 14px', fontSize:13, background:'#ef4444', color:'#fff', border:'none', borderRadius:8, cursor:'pointer' }}>
              🗑 Hapus {selected.size} yang dipilih
            </button>
          )}
          <span style={{ fontSize:13, color:'var(--text-3)' }}>
            {selected.size} terpilih
          </span>
        </div>
      )}

      {/* List */}
      {loading && entries.length===0 ? (
        <div style={{ textAlign:'center', padding:40, color:'var(--text-3)' }}>⏳ Memuat...</div>
      ) : entries.length===0 ? (
        <div style={{ textAlign:'center', padding:40, color:'var(--text-3)' }}>
          Tidak ada data untuk filter ini.<br/>
          <button className="btn btn-primary" style={{ marginTop:12 }} onClick={()=>navigate('/detection')}>Mulai Deteksi</button>
        </div>
      ) : (
        <>
          {entries.map(e => {
            const meta = EMOTION_META[e.dominantEmotion];
            const isSelected = selected.has(e._id);
            return (
              <div key={e._id} className="card" style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'12px 16px', marginBottom:8,
                background: isSelected ? 'var(--bg-accent)' : 'var(--bg-card)',
                border: isSelected ? '1.5px solid var(--brand)' : '1px solid var(--border)',
                transition:'all .15s',
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  {/* Checkbox pilih */}
                  {selectMode && (
                    <input type="checkbox" checked={isSelected} onChange={()=>toggleSelect(e._id)}
                      style={{ width:17, height:17, cursor:'pointer', flexShrink:0 }} />
                  )}
                  <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--bg-accent)',
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0,
                    cursor: selectMode ? 'pointer' : 'default' }}
                    onClick={() => selectMode && toggleSelect(e._id)}>
                    {meta.emoji}
                  </div>
                  <div>
                    <div style={{ fontSize:13, color:'var(--text-3)' }}>{formatTime(e.detectedAt)} · {e.source}</div>
                    <div style={{ fontWeight:600, fontSize:15 }}>
                      {e.dominantEmotion}
                      <span style={{ fontSize:12, color:'var(--text-3)', marginLeft:6 }}>{e.dominantConfidence.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div style={{ display:'flex', gap:8 }}>
                  {!selectMode && (
                    <>
                      <button className="btn btn-secondary" style={{ padding:'5px 12px', fontSize:12 }}
                        onClick={()=>navigate(`/result/${e._id}`)}>
                        Detail
                      </button>
                      <button onClick={()=>handleDelete(e._id)}
                        style={{ padding:'5px 10px', border:'none', background:'transparent',
                          color:'var(--danger)', cursor:'pointer', fontSize:16 }} title="Hapus">
                        🗑
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {pagination && page < pagination.totalPages && (
            <button className="btn btn-secondary" style={{ width:'100%', justifyContent:'center', marginTop:10 }}
              onClick={()=>{ const n=page+1; setPage(n); load(filter,n,true); }} disabled={loading}>
              {loading ? 'Memuat...' : 'Muat Lebih Banyak'}
            </button>
          )}
          {pagination && (
            <div style={{ textAlign:'center', marginTop:10, fontSize:13, color:'var(--text-3)' }}>
              {entries.length} dari {pagination.total} riwayat
            </div>
          )}
        </>
      )}

      {/* Modal Hapus Massal */}
      {showBulk && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:300,
          display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
          onClick={()=>!bulkLoading && setShowBulk(false)}>
          <div className="card" style={{ width:'100%', maxWidth:400, padding:28 }}
            onClick={e=>e.stopPropagation()}>
            <h3 style={{ fontSize:18, fontWeight:700, marginBottom:6 }}>🗑 Hapus Massal</h3>
            <p style={{ fontSize:14, color:'var(--text-2)', marginBottom:20 }}>
              Pilih riwayat mana yang ingin dihapus. Tindakan ini tidak bisa dibatalkan.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                { label:'Hapus riwayat hari ini', mode:'today' as const, color:'#f59e0b' },
                { label:'Hapus riwayat minggu ini', mode:'week' as const, color:'#f97316' },
                { label:'Hapus riwayat bulan ini', mode:'month' as const, color:'#ef4444' },
                { label:'Hapus SEMUA riwayat', mode:'all' as const, color:'#dc2626' },
              ].map(opt => (
                <button key={opt.mode} disabled={bulkLoading}
                  onClick={()=>handleBulkByPeriod(opt.mode)}
                  style={{ padding:'11px 16px', borderRadius:8, border:`1px solid ${opt.color}`,
                    background:'transparent', color:opt.color, fontWeight:600, fontSize:14,
                    cursor:'pointer', textAlign:'left' }}>
                  {bulkLoading ? '⏳ Menghapus...' : opt.label}
                </button>
              ))}
            </div>
            <button className="btn btn-secondary" style={{ width:'100%', justifyContent:'center', marginTop:14 }}
              onClick={()=>setShowBulk(false)} disabled={bulkLoading}>
              Batal
            </button>
          </div>
        </div>
      )}
    </PageLayout>
  );
};
export default History;