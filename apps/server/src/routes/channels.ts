import { Router, Request, Response } from 'express';
import { serverStore } from '../store.js';

const router = Router();

// GET /api/channels - Get all channels and their ENV configuration status
router.get('/', (_req: Request, res: Response) => {
  const envConfig = {
    instagram: !!(process.env.INSTAGRAM_ACCESS_TOKEN || process.env.INSTAGRAM_USER_ID),
    facebook: !!(process.env.FACEBOOK_PAGE_ACCESS_TOKEN || process.env.FACEBOOK_PAGE_ID),
    'x-twitter': !!(process.env.X_API_KEY || process.env.X_ACCESS_TOKEN),
    linkedin: !!(process.env.LINKEDIN_OAUTH_TOKEN || process.env.LINKEDIN_ORG_ID),
    wordpress: !!(process.env.WORDPRESS_APP_PASSWORD || process.env.WORDPRESS_SITE_URL),
    ghost: !!(process.env.GHOST_ADMIN_API_KEY || process.env.GHOST_ADMIN_URL),
    substack: !!(process.env.SUBSTACK_RSS_FEED_URL || process.env.SUBSTACK_PUBLICATION_URL),
    telegram: !!(process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_CHANNEL_ID),
  };

  res.json({ envConfig });
});

// GET /api/channels/syndications - Get syndication history logs
router.get('/syndications', (_req: Request, res: Response) => {
  const logs = serverStore.getSyndications();
  res.json({ syndications: logs });
});

// POST /api/channels/syndications/:id/repost - Re-syndicate / repost a failed dispatch
router.post('/syndications/:id/repost', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const updated = serverStore.repostSyndication(id);
  if (!updated) {
    return res.status(404).json({ error: 'Syndication log not found' });
  }
  res.json({ success: true, syndication: updated });
});

// DELETE /api/channels/syndications/:id - Remove / delete a syndication log
router.delete('/syndications/:id', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const ok = serverStore.deleteSyndication(id);
  if (!ok) {
    return res.status(404).json({ error: 'Syndication log not found' });
  }
  res.json({ success: true, id });
});

export default router;
