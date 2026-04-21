import { Request, Response } from 'express';
import {
  getMoodHistory,
  getMoodEntryById,
  deleteMoodEntry,
} from '../services/historyService';
import { ApiResponse } from '../types';

// TAMBAHAN: WebSocket broadcast
import { broadcast } from '../config/websocket';

/**
 * GET /api/history
 * Query params: page, limit, filter
 */
export const getHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const filter = (req.query.filter as string) || 'all';

    if (!['today', 'week', 'month', 'all'].includes(filter)) {
      res.status(400).json({
        success: false,
        message: 'filter must be: today, week, month, or all',
      } as ApiResponse);
      return;
    }

    const { entries, total } = await getMoodHistory({
      page,
      limit,
      filter: filter as 'today' | 'week' | 'month' | 'all',
    });

    res.status(200).json({
      success: true,
      message: 'History retrieved successfully',
      data: {
        entries,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve history',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse);
  }
};

/**
 * GET /api/history/:id
 */
export const getHistoryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const entry = await getMoodEntryById(req.params.id);

    if (!entry) {
      res.status(404).json({
        success: false,
        message: 'Mood entry not found',
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Entry retrieved successfully',
      data: entry,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve entry',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse);
  }
};

/**
 * DELETE /api/history/:id
 */
export const deleteHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deleted = await deleteMoodEntry(req.params.id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Mood entry not found',
      } as ApiResponse);
      return;
    }

    //  TAMBAHAN: realtime update ke frontend
    broadcast('history_update', {
      action: 'delete',
      id: req.params.id,
    });

    res.status(200).json({
      success: true,
      message: 'Mood entry deleted successfully',
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete entry',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse);
  }
};