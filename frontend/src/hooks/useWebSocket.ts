import { useEffect, useRef, useCallback } from 'react';
import { DashboardStats, MoodEntry } from '../types';

type WSEvent = 'detection' | 'stats_update' | 'history_update' | 'ping';

interface WSMessage {
  event: WSEvent;
  data: unknown;
  timestamp: string;
}

interface UseWebSocketOptions {
  onDetection?: (data: MoodEntry) => void;
  onStatsUpdate?: (data: DashboardStats) => void;
  onHistoryUpdate?: (data: { action: string; id: string }) => void;
}

const WS_URL = `ws://${window.location.hostname}:5000/ws`;

export function useWebSocket(options: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => console.log('WS connected');

      ws.onmessage = (event) => {
        try {
          const msg: WSMessage = JSON.parse(event.data);
          if (msg.event === 'ping') return;
          if (msg.event === 'detection' && optionsRef.current.onDetection) {
            optionsRef.current.onDetection(msg.data as MoodEntry);
          }
          if (msg.event === 'stats_update' && optionsRef.current.onStatsUpdate) {
            optionsRef.current.onStatsUpdate(msg.data as DashboardStats);
          }
          if (msg.event === 'history_update' && optionsRef.current.onHistoryUpdate) {
            optionsRef.current.onHistoryUpdate(msg.data as { action: string; id: string });
          }
        } catch (e) {
          console.warn('WS parse error', e);
        }
      };

      ws.onclose = () => {
        console.log('WS disconnected, reconnecting in 3s...');
        reconnectTimer.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch (e) {
      reconnectTimer.current = setTimeout(connect, 3000);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);
}