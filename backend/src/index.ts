import 'dotenv/config';
import app from './app';
import connectDB from './config/db';

const PORT = parseInt(process.env.PORT || '5000', 10);

const startServer = async (): Promise<void> => {
  await connectDB();

  app.listen(PORT, () => {
    console.log('');
    console.log('🎭 ================================');
    console.log(`🚀  Mood Detector API`);
    console.log(`📡  Port     : ${PORT}`);
    console.log(`🌍  Mode     : ${process.env.NODE_ENV || 'development'}`);
    console.log('🎭 ================================');
    console.log('');
    console.log('📋  Endpoints:');
    console.log(`    GET  http://localhost:${PORT}/api/health`);
    console.log(`    POST http://localhost:${PORT}/api/detect/camera`);
    console.log(`    POST http://localhost:${PORT}/api/detect/upload`);
    console.log(`    GET  http://localhost:${PORT}/api/history`);
    console.log(`    GET  http://localhost:${PORT}/api/history/:id`);
    console.log(`    DELETE http://localhost:${PORT}/api/history/:id`);
    console.log(`    GET  http://localhost:${PORT}/api/dashboard/stats`);
    console.log('');
  });
};

startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});