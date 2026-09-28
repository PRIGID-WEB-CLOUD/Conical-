import { Router, Request, Response } from 'express';
import { serverStore } from '../store.js';

const router = Router();

// GET /api/media
router.get('/', (req: Request, res: Response) => {
  const category = req.query.category as string | undefined;
  const search = req.query.search as string | undefined;
  const media = serverStore.getMedia({ category, search });
  res.json({ media });
});

// POST /api/media
router.post('/', (req: Request, res: Response) => {
  const { name, url, alt, caption, category, dimensions, sizeBytes, sizeFormatted, mimeType } = req.body;
  if (!name || !url) {
    return res.status(400).json({ error: 'Name and URL are required' });
  }

  const asset = serverStore.addMedia({
    name,
    url,
    alt: alt || name,
    caption: caption || '',
    category: category || 'Editorial',
    dimensions: dimensions || '1400x900',
    sizeBytes: sizeBytes || 350000,
    sizeFormatted: sizeFormatted || '342 KB',
    mimeType: mimeType || 'image/jpeg',
  });

  res.status(201).json({ asset });
});

// DELETE /api/media/:id
router.delete('/:id', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const ok = serverStore.deleteMedia(id);
  if (!ok) {
    return res.status(404).json({ error: 'Media not found' });
  }
  res.json({ success: true, id });
});

export default router;
