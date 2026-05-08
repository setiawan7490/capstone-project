import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth';
import detectionRoutes from './routes/detection';
import historyRoutes from './routes/history';
import dashboardRoutes from './routes/dashboard';
import { notFound, errorHandler } from './middleware/errorHandler';

const app = express();
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.get('/api/health', (_req, res) => res.json({ success: true, message: 'Mood Detector API v2 running' }));
app.use('/api/auth', authRoutes);
app.use('/api/detect', detectionRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use(notFound);
app.use(errorHandler);
export default app;