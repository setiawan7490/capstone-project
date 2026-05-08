import { Router } from 'express';
import { getStats } from '../controllers/dashboardController';
import { protect } from '../middleware/auth';
const r = Router();
r.use(protect);
r.get('/stats', getStats);
export default r;