import express from 'express';
import cors from 'cors';
import path from 'path';

import detectionRoutes from './routes/detection';
import historyRoutes from './routes/history';
import dashboardRoutes from './routes/dashboard';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { getConnectedClients } from './config/websocket';

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Mood Detector API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    wsClients: getConnectedClients(),
  });
});

app.use('/api/detect', detectionRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;