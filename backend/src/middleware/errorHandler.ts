import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('❌ Error:', err.message);

  // Multer error (file terlalu besar / tipe salah)
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB',
        error: err.message,
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: 'File upload error',
      error: err.message,
    });
    return;
  }

  // File type error dari filter kita
  if (err.message === 'Only JPG, PNG, and WEBP images are allowed') {
    res.status(400).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Generic error
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error:
      process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};