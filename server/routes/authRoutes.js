import { Router } from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  getCsrfToken
} from '../controllers/authController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', authenticateUser, getMe);
router.get('/csrf-token', getCsrfToken);

export default router;