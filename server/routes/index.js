import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import processRoutes from './processRoutes.js';
import documentRoutes from './documentRoutes.js';
import authRoutes from './authRoutes.js';
import questionRoutes from './questionRoutes.js';
import { csrfProtection } from '../middlewares/csrfMiddleware.js';

const router = Router();

router.use(csrfProtection);

router.use('/', healthRoutes);
router.use('/', authRoutes);
router.use('/', processRoutes);
router.use('/', documentRoutes);
router.use('/', questionRoutes);

export default router;