import { Router, Request, Response } from 'express';
import { serverStore } from '../store.js';

const router = Router();

// GET /api/authors - List all staff authors with article count
router.get('/', (_req: Request, res: Response) => {
  const authors = serverStore.getAuthors();
  res.json({ authors });
});

// GET /api/authors/:identifier - Get author details and published posts
router.get('/:identifier', (req: Request, res: Response) => {
  const identifier = String(req.params.identifier);
  const data = serverStore.getAuthorByIdOrSlug(identifier);

  if (!data) {
    return res.status(404).json({ error: 'Author not found' });
  }

  res.json(data);
});

export default router;
