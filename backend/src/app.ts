import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth';
import detectionRoutes from './routes/detection';
import historyRoutes from './routes/history';
import dashboardRoutes from './routes/dashboard';
import { notFound, errorHandler } from './middleware/errorHandler';
import { downloadFromGridFS } from './config/gridfs';

const app = express();

app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// ── Health check ──────────────────────────────────────────────────
app.get('/api/health', (_req, res) =>
  res.json({ success: true, message: 'Mood Detector API v2 running' })
);

// ── Serve gambar dari GridFS (pengganti express.static('/uploads')) ──
app.get('/api/images/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ success: false, message: 'ID gambar tidak valid' });
      return;
    }
    const { buffer, contentType } = await downloadFromGridFS(req.params.id);
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=31536000'); // cache 1 tahun di browser
    res.send(buffer);
  } catch (e) {
    const msg = (e as Error).message || '';
    if (msg.includes('tidak ditemukan') || msg.includes('not found')) {
      res.status(404).json({ success: false, message: 'Gambar tidak ditemukan' });
    } else {
      res.status(500).json({ success: false, message: 'Gagal mengambil gambar', error: msg });
    }
  }
});

// ── API routes ────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/detect',    detectionRoutes);
app.use('/api/history',   historyRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
