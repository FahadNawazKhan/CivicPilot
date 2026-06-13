import { Router } from 'express';
import {
  getAllProcesses,
  getProcessById,
  handleDiscover,
  handleChat
} from '../controllers/processController.js';
import {
  getProgress,
  saveProgress
} from '../controllers/progressController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/processes', getAllProcesses);
router.get('/processes/:id', getProcessById);
router.post('/discover', handleDiscover);
router.post('/chat', handleChat);

// User Progress persistence endpoints (session secured)
router.get('/progress', authenticateUser, getProgress);
router.post('/progress', authenticateUser, saveProgress);

export default router;