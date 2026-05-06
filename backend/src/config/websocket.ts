import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

let wss: WebSocketServer | null = null;

export function initWebSocket(server: Server): void {
  wss = new WebSocketServer({ server, path: '/ws' });
  wss.on('connection', (ws) => {
    const ping = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN)
        ws.send(JSON.stringify({ event: 'ping', timestamp: new Date().toISOString() }));
    }, 25000);
    ws.on('close', () => clearInterval(ping));
    ws.on('error', () => ws.close());
  });
}

export function broadcast(event: string, data: unknown): void {
  if (!wss) return;
  const msg = JSON.stringify({ event, data, timestamp: new Date().toISOString() });
  wss.clients.forEach((c) => { if (c.readyState === WebSocket.OPEN) c.send(msg); });
}