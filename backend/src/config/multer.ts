import multer from 'multer';

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Only JPG/PNG/WEBP allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});