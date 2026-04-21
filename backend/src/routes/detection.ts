import { Router } from 'express';
import { detectFromCamera, detectFromUpload } from '../controllers/detectionController';
import { upload } from '../config/multer';

const router = Router();

/**
 * POST /api/detect/camera
 * Body: {} (tidak perlu file, mock langsung)
 */
router.post('/camera', detectFromCamera);

/**
 * POST /api/detect/upload
 * Body: multipart/form-data, field "image"
 */
router.post('/upload', upload.single('image'), detectFromUpload);

export default router;