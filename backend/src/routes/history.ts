import { Router } from 'express';
import { getHistory, getHistoryById, deleteHistory, bulkDeleteHistory } from '../controllers/historyController';
import { protect } from '../middleware/auth';

const r = Router();
r.use(protect);

r.get('/',         getHistory);
r.get('/:id',      getHistoryById);
r.delete('/bulk',  bulkDeleteHistory);  // HARUS sebelum /:id agar tidak bentrok
r.delete('/:id',   deleteHistory);

export default r;