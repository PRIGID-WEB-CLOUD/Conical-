import { Router, Request, Response } from 'express';
import { serverStore } from '../store.js';

const router = Router();

// GET /api/settings
router.get('/', (_req: Request, res: Response) => {
  const settings = serverStore.getSettings();
  const analytics = serverStore.getAnalytics();
  const activities = serverStore.getActivities();
  res.json({ settings, analytics, activities });
});

// PUT /api/settings
router.put('/', (req: Request, res: Response) => {
  const updated = serverStore.updateSettings(req.body);
  res.json({ settings: updated });
});

export default router;
