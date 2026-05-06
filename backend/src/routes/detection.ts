import { Router } from 'express';
import { detectFromCamera, detectFromUpload } from '../controllers/detectionController';
import { protect } from '../middleware/auth';
import { upload } from '../config/multer';
const r = Router();
r.use(protect);
r.post('/camera', detectFromCamera);
r.post('/upload', upload.single('image'), detectFromUpload);
export default r;