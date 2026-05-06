import { Router } from 'express';
import { getHistory, getHistoryById, deleteHistory } from '../controllers/historyController';
import { protect } from '../middleware/auth';
const r = Router();
r.use(protect);
r.get('/', getHistory);
r.get('/:id', getHistoryById);
r.delete('/:id', deleteHistory);
export default r;