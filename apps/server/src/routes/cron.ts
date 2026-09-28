import { Router } from 'express';
import { store } from '../store.js';
import { Post } from '../../../../packages/shared/src/types.js';

const router = Router();

// GET /api/cron/status - Returns active background scheduler status & stats
router.get('/status', (_req, res) => {
  const allScheduled = store.getPosts({ status: 'scheduled' });
  res.json({
    status: 'active',
    scheduler: 'Chronicle Publisher Automated Cron Engine',
    intervalSeconds: 5,
    stats: store.cronStats,
    queuedScheduledCount: allScheduled.length,
    queuedPosts: allScheduled.map((p: Post) => ({
      id: p.id,
      title: p.title,
      scheduledAt: p.scheduledAt,
      category: p.category,
      author: p.author.name,
    })),
  });
});

// POST /api/cron/trigger - On-demand manual trigger for scheduled post release
router.post('/trigger', (_req, res) => {
  const result = store.runCronJob();
  res.json({
    success: true,
    message: result.publishedCount > 0
      ? `Successfully auto-published ${result.publishedCount} scheduled article(s).`
      : 'Cron execution completed. No pending scheduled posts matured at this time.',
    result,
  });
});

// GET /api/cron/scheduled - Returns list of scheduled posts queued in publishing pipeline
router.get('/scheduled', (_req, res) => {
  const scheduledPosts = store.getPosts({ status: 'scheduled' });
  res.json({
    count: scheduledPosts.length,
    posts: scheduledPosts,
  });
});

export default router;
