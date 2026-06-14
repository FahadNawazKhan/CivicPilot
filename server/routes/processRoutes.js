import { Router } from 'express';
import {
  getAllProcesses,
  getProcessById,
  handleDiscover,
  handleChat
} from '../controllers/processController.js';
import {
  getProgress,
  saveProgress,
  getVaultInsights
} from '../controllers/progressController.js';
import { authenticateUser, optionalAuthenticate } from '../middlewares/authMiddleware.js';
import {
  getTipsByProcess,
  createTip,
  upvoteTip
} from '../controllers/tipController.js';

const router = Router();

router.get('/processes', getAllProcesses);
router.get('/processes/:id', getProcessById);
router.post('/discover', handleDiscover);
router.post('/chat', handleChat);

// User Progress persistence endpoints (session secured)
router.get('/progress', authenticateUser, getProgress);
router.post('/progress', authenticateUser, saveProgress);
router.get('/vault/insights', authenticateUser, getVaultInsights);

// Citizen Experience Tips endpoints (public read, session-aware write/upvote)
router.get('/tips/:processId', getTipsByProcess);
router.post('/tips', optionalAuthenticate, createTip);
router.post('/tips/:tipId/upvote', optionalAuthenticate, upvoteTip);

export default router;