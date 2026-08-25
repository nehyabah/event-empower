import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { MulterError } from 'multer';

export interface AppError extends Error {
  statusCode?: number;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', err);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation error',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Uploads that exceed the limit arrive here as a MulterError; without this
  // they fall through to the generic branch and the user sees "Internal server
  // error" with no hint that the file was simply too big.
  if (err instanceof MulterError) {
    const tooLarge = err.code === 'LIMIT_FILE_SIZE';
    res.status(tooLarge ? 413 : 400).json({
      error: tooLarge
        ? 'That image is too large. Please upload a file under 12MB.'
        : `Upload failed: ${err.message}`,
    });
    return;
  }

  // Handle known application errors
  if (err.statusCode) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Handle other errors
  const statusCode = err.message.includes('not found')
    ? 404
    : err.message.includes('already') || err.message.includes('Invalid')
    ? 400
    : 500;

  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal server error' : err.message,
  });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Route not found' });
}
