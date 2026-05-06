import { Request, Response } from 'express';
import { getMoodHistory, getMoodEntryById, deleteMoodEntry } from '../services/historyService';
import { broadcast } from '../config/websocket';

export const getHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const filter = (req.query.filter as string) || 'all';
    const { entries, total } = await getMoodHistory(req.user!.userId, { page, limit, filter });
    res.json({ success: true, message: 'OK', data: { entries, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed', error: (e as Error).message });
  }
};

export const getHistoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const entry = await getMoodEntryById(req.params.id, req.user!.userId);
    if (!entry) { res.status(404).json({ success: false, message: 'Not found' }); return; }
    res.json({ success: true, message: 'OK', data: entry });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed', error: (e as Error).message });
  }
};

export const deleteHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await deleteMoodEntry(req.params.id, req.user!.userId);
    if (!deleted) { res.status(404).json({ success: false, message: 'Not found' }); return; }
    broadcast('history_update', { action: 'delete', id: req.params.id });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed', error: (e as Error).message });
  }
};