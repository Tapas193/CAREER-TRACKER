import { Request, Response } from 'express';
import { storage } from '../services/storage';
import { success, asyncHandler } from '../utils/http';
import { validateFilename } from '../middleware/upload';
import { AppError } from '../utils/http';

export const uploadController = {
  upload: asyncHandler(async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) {
      throw new AppError('No file uploaded', 400);
    }
    if (!validateFilename(file.originalname)) {
      throw new AppError('Invalid file name', 400);
    }
    const result = await storage.save(file);
    return success(res, result, 'File uploaded');
  }),
};
