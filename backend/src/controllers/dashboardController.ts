import { Request, Response } from 'express';
import { getDashboardStats } from '../services/historyService';
import { ApiResponse } from '../types';

/**
 * GET /api/dashboard/stats
 */
export const getStats = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const stats = await getDashboardStats();

    const response: ApiResponse = {
      success: true,
      message: 'Dashboard stats retrieved successfully',
      data: stats,
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard stats',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse);
  }
};