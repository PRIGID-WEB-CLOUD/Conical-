import { Router, Request, Response } from 'express';
import { serverStore } from '../store.js';

const router = Router();

// GET /api/comments
router.get('/', (req: Request, res: Response) => {
  const postId = req.query.postId as string | undefined;
  const comments = serverStore.getComments(postId);
  res.json({ comments });
});

// POST /api/comments
router.post('/', (req: Request, res: Response) => {
  const { postId, content, authorName } = req.body;
  if (!postId || !content) {
    return res.status(400).json({ error: 'postId and content are required' });
  }
  const comment = serverStore.addComment(postId, content, authorName);
  res.status(201).json({ comment });
});

// POST /api/comments/:id/reply
router.post('/:id/reply', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { reply } = req.body;
  if (!reply) {
    return res.status(400).json({ error: 'Reply content required' });
  }
  const updated = serverStore.replyToComment(id, reply);
  if (!updated) {
    return res.status(404).json({ error: 'Comment not found' });
  }
  res.json({ comment: updated });
});

// DELETE /api/comments/:id
router.delete('/:id', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const ok = serverStore.deleteComment(id);
  if (!ok) {
    return res.status(404).json({ error: 'Comment not found' });
  }
  res.json({ success: true });
});

// PUT /api/comments/:id - Edit/update an existing comment
router.put('/:id', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Comment content required' });
  }
  const updated = serverStore.updateComment(id, content);
  if (!updated) {
    return res.status(404).json({ error: 'Comment not found' });
  }
  res.json({ comment: updated });
});

// POST /api/comments/:id/like - Like or unlike a comment
router.post('/:id/like', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { decrement } = req.body;
  const updated = serverStore.toggleCommentLike(id, !!decrement);
  if (!updated) {
    return res.status(404).json({ error: 'Comment not found' });
  }
  res.json({ comment: updated, likes: updated.likes });
});

export default router;
