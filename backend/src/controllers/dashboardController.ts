import { Request, Response } from 'express';
import { getDashboardStats } from '../services/historyService';

export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await getDashboardStats(req.user!.userId);
    res.json({ success: true, message: 'OK', data: stats });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed', error: (e as Error).message });
  }
};