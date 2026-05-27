import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import SectionTitle from '../components/SectionTitle';
import EmotionBar from '../components/EmotionBar';
import { apiGetHistoryById } from '../services/index';
import { MoodEntry, EmotionType } from '../types';
import { EMOTION_META, formatTime } from '../utils/emotionMeta';

const MESSAGES: Record<EmotionType, { heading: string; msg: string }> = {
  Happy:    { heading:'You look happy today! 😄', msg:'Keep spreading that positive energy. Stay hydrated and enjoy your day!' },
  Sad:      { heading:'You seem a little sad today. 😢', msg:"It's okay to feel sad. Take a breath, be kind to yourself. 💙" },
  Angry:    { heading:'You look a bit tense. 😠', msg:'Take a moment to breathe. Let the tension go — you\'ve got this. 💪' },
  Fear:     { heading:'You seem worried. 😨', msg:'Face it one small step at a time. You are braver than you think. 🌟' },
  Surprise: { heading:'You look surprised! 😮', msg:"Life's full of surprises. Embrace this unexpected moment! 🎉" },
  Neutral:  { heading:'You look calm today. 😐', msg:'A calm mind is a powerful mind. Keep it steady! 🧘' },
};

const Result: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<MoodEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { navigate('/'); return; }
    apiGetHistoryById(id).then(res => {
      if (res.success && res.data) setEntry(res.data);
      setLoading(false);
    });
  }, [id, navigate]);

  if (loading) return <PageLayout><div style={{ textAlign:'center',padding:60,color:'var(--text-3)' }}>⏳ Memuat hasil...</div></PageLayout>;
  if (!entry) return <PageLayout><div style={{ textAlign:'center',padding:60,color:'var(--text-3)' }}>Hasil tidak ditemukan. <button className="btn btn-primary" onClick={()=>navigate('/')}>Home</button></div></PageLayout>;

  const meta = EMOTION_META[entry.dominantEmotion];
  const msg = MESSAGES[entry.dominantEmotion];

  return (
    <PageLayout>
      <SectionTitle title="Analysis Result" />
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20 }} className="grid-2">
        <div className="card" style={{ padding:22 }}>
          <div style={{ display:'flex',alignItems:'center',gap:16,marginBottom:18 }}>
            <div style={{ width:72,height:72,borderRadius:'50%',background:'var(--bg-accent)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:38,flexShrink:0 }}>{meta.emoji}</div>
            <div>
              <div style={{ fontSize:28,fontWeight:800,color:'var(--text)' }}>{entry.dominantEmotion}</div>
              <div style={{ fontSize:13,color:'var(--text-3)',marginBottom:6 }}>Primary Emotion</div>
              <div style={{ height:7,width:180,background:'var(--border)',borderRadius:4,overflow:'hidden' }}>
                <div style={{ height:'100%',width:`${entry.dominantConfidence}%`,background:meta.color,borderRadius:4 }} />
              </div>
              <div style={{ fontSize:12,color:'var(--text-3)',marginTop:3 }}>{entry.dominantConfidence.toFixed(1)}% confidence</div>
            </div>
          </div>
          <div style={{ fontSize:12,color:'var(--text-3)',marginBottom:12 }}>{formatTime(entry.detectedAt)} · via {entry.source}</div>
          <div style={{ fontWeight:700,fontSize:14,marginBottom:10 }}>Emotion Breakdown</div>
          {entry.allEmotions.map(e => (
            <EmotionBar key={e.emotion} emoji={EMOTION_META[e.emotion as EmotionType]?.emoji||''} label={e.emotion} value={e.confidence} color={EMOTION_META[e.emotion as EmotionType]?.color} />
          ))}
        </div>

        <div className="card" style={{ minHeight:280,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',background:'var(--bg)' }}>
          {entry.imageUrl
            ? <img src={`${(import.meta as any).env?.VITE_API_URL?.replace('/api','') || ''}${entry.imageUrl}`} alt="captured" style={{ width:'100%',maxHeight:320,objectFit:'cover' }} />
            : <div style={{ border:`2px solid var(--brand)`,borderRadius:8,width:200,height:200,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-3)',fontSize:14 }}>[ Captured Image ]</div>}
        </div>
      </div>

      <div style={{ background:'var(--bg-accent)',borderRadius:12,padding:'18px 22px',marginBottom:20 }}>
        <div style={{ fontSize:17,fontWeight:700,marginBottom:6 }}>💬 {msg.heading}</div>
        <div style={{ fontSize:14,color:'var(--text-2)' }}>{msg.msg}</div>
      </div>

      <div style={{ display:'flex',gap:10,flexWrap:'wrap' }}>
        <button className="btn btn-primary" onClick={()=>navigate('/detection')}>↩ Detect Again</button>
        <button className="btn btn-secondary" onClick={()=>navigate(`/recommendation/${entry._id}`)}>💡 Recommendation</button>
        <button className="btn btn-secondary" onClick={()=>navigate('/dashboard')}>📊 Dashboard</button>
        <button className="btn btn-secondary" onClick={()=>navigate('/history')}>📋 History</button>
      </div>
    </PageLayout>
  );
};
export default Result;