import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
};

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({ success: false, message: err.code === 'LIMIT_FILE_SIZE' ? 'Max file size 5MB' : err.message });
    return;
  }
  res.status(500).json({ success: false, message: err.message || 'Internal server error' });
};