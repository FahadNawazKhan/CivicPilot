import { Router } from 'express';

const router = Router();

router.get('/health', (_req, res) => {
    res.json({ status: 'healthy', time: new Date().toISOString() });
});

export default router;