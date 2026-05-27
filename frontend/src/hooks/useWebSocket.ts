import { useEffect, useRef, useCallback } from 'react';
import { DashboardStats, MoodEntry } from '../types';

interface Options {
  onDetection?: (data: MoodEntry) => void;
  onStatsUpdate?: (data: DashboardStats) => void;
  onHistoryUpdate?: (data: { action: string; id: string }) => void;
}

function getWsUrl(): string {
  // Untuk production: gunakan VITE_WS_URL dari environment variable
  const envWs = (import.meta as any).env?.VITE_WS_URL as string | undefined;
  if (envWs) return envWs;

  // Fallback untuk development lokal
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.hostname;
  const isDev = (import.meta as any).env?.DEV as boolean | undefined;
  const portStr = isDev ? ':5000' : (window.location.port ? `:${window.location.port}` : '');
  return `${protocol}//${host}${portStr}/ws`;
}

export function useWebSocket(options: Options) {
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const optsRef = useRef(options);
  optsRef.current = options;

  const connect = useCallback(() => {
    try {
      const url = getWsUrl();
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg.event === 'detection' && optsRef.current.onDetection) optsRef.current.onDetection(msg.data);
          if (msg.event === 'stats_update' && optsRef.current.onStatsUpdate) optsRef.current.onStatsUpdate(msg.data);
          if (msg.event === 'history_update' && optsRef.current.onHistoryUpdate) optsRef.current.onHistoryUpdate(msg.data);
        } catch {}
      };

      ws.onclose = () => { timerRef.current = setTimeout(connect, 3000); };
      ws.onerror = () => { ws.close(); };
    } catch {
      timerRef.current = setTimeout(connect, 3000);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      wsRef.current?.close();
    };
  }, [connect]);
}