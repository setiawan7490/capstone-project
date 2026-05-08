import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import { protect } from '../middleware/auth';
const r = Router();
r.post('/register', register);
r.post('/login', login);
r.get('/me', protect, getMe);
export default r;