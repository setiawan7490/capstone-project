import { useEffect, useRef, useCallback } from 'react';
import { DashboardStats, MoodEntry } from '../types';

interface Options {
  onDetection?: (data: MoodEntry) => void;
  onStatsUpdate?: (data: DashboardStats) => void;
  onHistoryUpdate?: (data: { action: string; id: string }) => void;
}

export function useWebSocket(options: Options) {
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const optsRef = useRef(options);
  optsRef.current = options;

  const connect = useCallback(() => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.hostname;
      // Di dev (port 5173) proxy ke backend port 5000, di production pakai port yang sama
      const isDev = window.location.port === '5173';
      const port = isDev ? '5000' : window.location.port;
      const url = `${protocol}//${host}:${port}/ws`;

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