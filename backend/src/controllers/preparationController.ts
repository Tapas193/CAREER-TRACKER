import { Request, Response } from 'express';
import { preparationService } from '../services/preparationService';
import { success, asyncHandler } from '../utils/http';
import { Role } from '@prisma/client';

export const preparationController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const isAdmin = req.user!.role === Role.ADMIN;
    const data = await preparationService.list({
      category: req.query.category as string | undefined,
      topic: req.query.topic as string | undefined,
      resourceType: req.query.resourceType as string | undefined,
      difficulty: req.query.difficulty as string | undefined,
      includeInactive: isAdmin && req.query.includeInactive === 'true',
    });
    return success(res, data, 'Preparation resources fetched');
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const resource = await preparationService.getById(Number(req.params.id));
    if (req.user!.role !== Role.ADMIN && !resource.isActive) {
      return success(res, null, 'Preparation resource not found');
    }
    return success(res, resource, 'Preparation resource fetched');
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const resource = await preparationService.create(req.validated);
    return success(res, resource, 'Preparation resource created', 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const resource = await preparationService.update(Number(req.params.id), req.validated);
    return success(res, resource, 'Preparation resource updated');
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await preparationService.delete(Number(req.params.id));
    return success(res, null, 'Preparation resource deleted');
  }),
};
