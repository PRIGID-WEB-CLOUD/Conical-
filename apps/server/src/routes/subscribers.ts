import { Router, Request, Response } from 'express';
import { serverStore } from '../store.js';

const router = Router();

// GET /api/subscribers
router.get('/', (req: Request, res: Response) => {
  const subscribers = serverStore.getSubscribers();
  res.json({ subscribers, total: subscribers.length });
});

// POST /api/subscribers
router.post('/', (req: Request, res: Response) => {
  const { email, tier } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }
  const subscriber = serverStore.addSubscriber(email, tier);
  res.status(201).json({ subscriber });
});

export default router;
