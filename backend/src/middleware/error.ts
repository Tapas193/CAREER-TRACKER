import { Response, NextFunction } from 'express';
import { AppError } from '../utils/http';
import { failure } from '../utils/http';
import { Prisma } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import { config } from '../config';

export function notFound(req: AuthenticatedRequest, res: Response) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err: any, req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  // Handle our own AppError
  if (err instanceof AppError) {
    return failure(res, err.message, err.status, err.errors);
  }

  // Zod validation errors thrown by validators
  if (err?.name === 'ZodError') {
    const errors = err.issues?.map((i: any) => ({ path: i.path.join('.'), message: i.message }));
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  // Prisma known request errors (unique constraint etc.)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[] | undefined)?.join(', ') || 'field';
      return res.status(409).json({ success: false, message: `A record with the same ${target} already exists` });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    return res.status(400).json({ success: false, message: 'Database error', errors: [err.message] });
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({ success: false, message: 'Invalid data provided' });
  }

  // Multer / file upload errors
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: 'File too large' });
  }

  if (err?.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ success: false, message: 'Unexpected file field' });
  }

  if (err?.status === 413) {
    return res.status(413).json({ success: false, message: err.message });
  }

  // Fallback - never leak stack traces in production
  if (config.nodeEnv === 'production') {
    console.error('Unhandled error:', err);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }

  console.error('Unhandled error:', err);
  return res.status(err?.status || 500).json({
    success: false,
    message: err?.message || 'Something went wrong',
  });
}
