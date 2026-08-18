import { Router, Request, Response, NextFunction } from 'express';
import { Readable } from 'stream';
import { storageService } from '../services/storageService.js';

const router = Router();

/**
 * Re-signing media proxy.
 *
 * Persisted image URLs point here rather than at a presigned S3 URL, because a
 * presigned URL expires an hour after upload and the stored copy then rots.
 * Keys contain a random UUID, so they are unguessable — the same reachability
 * model the presigned links already had.
 */
router.get(/^\/(.+)$/, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = decodeURIComponent((req.params as unknown as string[])[0] || '');

    // Refuse traversal and empty keys.
    if (!key || key.includes('..')) {
      res.status(400).json({ error: 'Invalid media key' });
      return;
    }

    if (!storageService.isConfigured) {
      res.status(404).json({ error: 'Media not found' });
      return;
    }

    const object = await storageService.getObject(key);

    if (object.ContentType) res.setHeader('Content-Type', object.ContentType);
    if (object.ContentLength) res.setHeader('Content-Length', String(object.ContentLength));
    if (object.ETag) res.setHeader('ETag', object.ETag);
    // Immutable: keys are content-addressed by UUID and never rewritten.
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    // Helmet defaults Cross-Origin-Resource-Policy to same-origin, which stops
    // the web app embedding these images whenever it is served from a different
    // origin than the API (dev on :8080 vs :3001, and split deployments).
    // They are already publicly reachable by unguessable key, so allow it.
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    const body = object.Body as Readable | undefined;
    if (!body) {
      res.status(404).json({ error: 'Media not found' });
      return;
    }

    body.on('error', next);
    body.pipe(res);
  } catch (error) {
    const name = (error as { name?: string })?.name;
    if (name === 'NoSuchKey' || name === 'NotFound') {
      res.status(404).json({ error: 'Media not found' });
      return;
    }
    next(error);
  }
});

export default router;
