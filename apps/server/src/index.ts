import express from 'express';
import cors from 'cors';
import postsRouter from './routes/posts.js';
import commentsRouter from './routes/comments.js';
import subscribersRouter from './routes/subscribers.js';
import settingsRouter from './routes/settings.js';
import mediaRouter from './routes/media.js';
import aiRouter from './routes/ai.js';
import cronRouter from './routes/cron.js';
import authorsRouter from './routes/authors.js';
import channelsRouter from './routes/channels.js';
import { store } from './store.js';

let cronTimerStarted = false;

export function createApiApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Start automated background cron scheduler (every 5 seconds)
  if (!cronTimerStarted) {
    cronTimerStarted = true;
    setInterval(() => {
      store.runCronJob();
    }, 5000);
  }

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Chronicle REST & AI Engine',
      cronScheduler: 'Active (5s cycle)',
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes
  app.use('/api/posts', postsRouter);
  app.use('/api/comments', commentsRouter);
  app.use('/api/subscribers', subscribersRouter);
  app.use('/api/settings', settingsRouter);
  app.use('/api/media', mediaRouter);
  app.use('/api/ai', aiRouter);
  app.use('/api/cron', cronRouter);
  app.use('/api/authors', authorsRouter);
  app.use('/api/channels', channelsRouter);

  return app;
}

// Standalone runner for independent deployment
if (process.env.STANDALONE_SERVER === 'true' || process.env.NODE_ENV === 'production') {
  const app = createApiApp();
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Chronicle REST & AI API Server running on port ${PORT}`);
  });
}
