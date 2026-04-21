import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

type WSEventType = 'detection' | 'stats_update' | 'history_update' | 'ping';

interface WSMessage {
  event: WSEventType;
  data: unknown;
  timestamp: string;
}

let wss: WebSocketServer | null = null;

export function initWebSocket(server: Server): WebSocketServer {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('🔌 WebSocket client connected');

    // Kirim ping setiap 30 detik supaya koneksi tetap hidup
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ event: 'ping', data: null, timestamp: new Date().toISOString() }));
      }
    }, 30000);

    ws.on('close', () => {
      clearInterval(pingInterval);
      console.log('🔌 WebSocket client disconnected');
    });

    ws.on('error', (err: { message: any; }) => {
      console.error('WebSocket error:', err.message);
      clearInterval(pingInterval);
    });
  });

  console.log('🔌 WebSocket server initialized at /ws');
  return wss;
}

/** Broadcast pesan ke semua client yang terhubung */
export function broadcast(event: WSEventType, data: unknown): void {
  if (!wss) return;

  const message: WSMessage = {
    event,
    data,
    timestamp: new Date().toISOString(),
  };

  const payload = JSON.stringify(message);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

export function getConnectedClients(): number {
  if (!wss) return 0;
  return wss.clients.size;
}