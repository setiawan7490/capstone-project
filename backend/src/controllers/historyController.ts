import { Request, Response } from 'express';
import {
  getMoodHistory, getMoodEntryById,
  deleteMoodEntry, bulkDeleteMoodEntries,
  getBulkMoodEntryGridFsIds,
} from '../services/historyService';
import { deleteFromGridFS } from '../config/gridfs';
import { broadcast } from '../config/websocket';

export const getHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const page   = parseInt(req.query.page  as string) || 1;
    const limit  = parseInt(req.query.limit as string) || 10;
    const filter = (req.query.filter as string) || 'all';
    const { entries, total } = await getMoodHistory(req.user!.userId, { page, limit, filter });
    res.json({
      success: true, message: 'OK',
      data: { entries, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } },
    });
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

    // Hapus gambar dari GridFS jika ada
    if (deleted.imageGridFsId) {
      await deleteFromGridFS(deleted.imageGridFsId).catch(err =>
        console.error('GridFS delete warning:', err.message)
      );
    }

    broadcast('history_update', { action: 'delete', id: req.params.id });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed', error: (e as Error).message });
  }
};

/**
 * DELETE /api/history/bulk
 * body: { mode: 'all'|'today'|'week'|'month'|'ids', ids?: string[] }
 */
export const bulkDeleteHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { mode, ids } = req.body as { mode: 'all' | 'today' | 'week' | 'month' | 'ids'; ids?: string[] };

    if (!['all', 'today', 'week', 'month', 'ids'].includes(mode)) {
      res.status(400).json({ success: false, message: 'mode harus: all, today, week, month, atau ids' });
      return;
    }
    if (mode === 'ids' && (!ids || ids.length === 0)) {
      res.status(400).json({ success: false, message: 'ids wajib diisi untuk mode ids' });
      return;
    }

    // Kumpulkan gridFsId SEBELUM dihapus dari collection MoodEntry
    const gridFsIds = await getBulkMoodEntryGridFsIds(req.user!.userId, mode, ids);

    const count = await bulkDeleteMoodEntries(req.user!.userId, mode, ids);

    // Hapus semua gambar dari GridFS (paralel, error per-file diabaikan)
    await Promise.allSettled(
      gridFsIds.map(gId => deleteFromGridFS(gId))
    );

    broadcast('history_update', { action: 'bulk_delete', mode });
    res.json({
      success: true,
      message: `${count} riwayat berhasil dihapus`,
      data: { deletedCount: count },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Bulk delete failed', error: (e as Error).message });
  }
};
