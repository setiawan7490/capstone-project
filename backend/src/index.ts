import 'dotenv/config';
import http from 'http';
import app from './app';
import connectDB from './config/db';
import { initGridFS } from './config/gridfs';
import { initWebSocket } from './config/websocket';

const PORT = parseInt(process.env.PORT || '5000', 10);

(async () => {
  await connectDB();
  initGridFS(); // Harus dipanggil setelah koneksi Mongoose terbuka
  const server = http.createServer(app);
  initWebSocket(server);
  server.listen(PORT, () => {
    console.log(`\n🚀 Server: http://localhost:${PORT}`);
    console.log(`🔌 WS:     ws://localhost:${PORT}/ws\n`);
  });
})();
