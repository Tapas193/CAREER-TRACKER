import { Request, Response } from 'express';
import { dashboardService } from '../services/dashboardService';
import { success, asyncHandler } from '../utils/http';

export const dashboardController = {
  get: asyncHandler(async (req: Request, res: Response) => {
    const data = await dashboardService.get(req.user!);
    return success(res, data, 'Dashboard fetched');
  }),
};
