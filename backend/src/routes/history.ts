import { Router } from 'express';
import {
  getHistory,
  getHistoryById,
  deleteHistory,
} from '../controllers/historyController';

const router = Router();

/**
 * GET /api/history
 * Query: ?page=1&limit=20&filter=today|week|month|all
 */
router.get('/', getHistory);

/**
 * GET /api/history/:id
 */
router.get('/:id', getHistoryById);

/**
 * DELETE /api/history/:id
 */
router.delete('/:id', deleteHistory);

export default router;