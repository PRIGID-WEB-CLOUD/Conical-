import { Router, Request, Response } from 'express';
import { serverStore } from '../store.js';

const router = Router();

// GET /api/posts - Get list of posts with optional filter
router.get('/', (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const category = req.query.category as string | undefined;
  const search = req.query.search as string | undefined;

  const posts = serverStore.getPosts({ status, category, search });
  res.json({
    posts,
    total: posts.length,
  });
});

// GET /api/posts/:identifier - Get single post by ID or Slug
router.get('/:identifier', (req: Request, res: Response) => {
  const identifier = String(req.params.identifier);
  const trackView = req.query.trackView === 'true' || req.query.view === 'true';

  let post = serverStore.getPostByIdOrSlug(identifier);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  if (trackView) {
    post = serverStore.incrementPostViews(identifier) || post;
  }

  res.json({ post });
});

// POST /api/posts/:identifier/view - Explicitly record article view
router.post('/:identifier/view', (req: Request, res: Response) => {
  const identifier = String(req.params.identifier);
  const post = serverStore.incrementPostViews(identifier);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  res.json({ success: true, views: post.views });
});

// POST /api/posts - Create or upsert post
router.post('/', (req: Request, res: Response) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const saved = serverStore.savePost(req.body);
  res.status(201).json({ post: saved });
});

// PUT /api/posts/:id - Update existing post
router.put('/:id', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const saved = serverStore.savePost({
    ...req.body,
    id,
  });
  res.json({ post: saved });
});

// DELETE /api/posts/:id - Delete post
router.delete('/:id', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const deleted = serverStore.deletePost(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Post not found' });
  }
  res.json({ success: true, id });
});

// POST /api/posts/:id/like - Like or unlike a post on the server
router.post('/:id/like', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { decrement } = req.body;
  const post = serverStore.incrementPostLikes(id, !!decrement);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  res.json({ success: true, likes: (post as any).likes || 0 });
});

// POST /api/posts/:id/share - Share or unshare a post on the server
router.post('/:id/share', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { decrement } = req.body;
  const post = serverStore.incrementPostShares(id, !!decrement);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  res.json({ success: true, shares: post.shares || 0 });
});

export default router;
