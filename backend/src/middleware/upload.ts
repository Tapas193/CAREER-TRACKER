import multer from 'multer';
import path from 'path';
import { Request } from 'express';

const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// Use memory storage so the StorageService abstraction handles persistence
const storage = multer.memoryStorage();

function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (!ALLOWED_MIME.has(file.mimetype)) {
    const err: any = new Error('Unsupported file type');
    err.status = 415;
    return cb(err);
  }
  cb(null, true);
}

export const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE, files: 1 },
  fileFilter,
});

export function validateFilename(name: string): boolean {
  if (!name) return false;
  const base = path.basename(name);
  // Sanitize: no path traversal
  if (base !== name || base.includes('..')) return false;
  // Reject control characters
  const hasControlChar = Array.from(base).some((c) => c.charCodeAt(0) < 32);
  if (hasControlChar) return false;
  return true;
}
