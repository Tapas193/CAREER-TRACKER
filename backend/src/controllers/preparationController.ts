import { Request, Response } from 'express';
import { preparationService } from '../services/preparationService';
import { notificationService } from '../services/notificationService';
import { success, asyncHandler } from '../utils/http';
import { NotificationType, Role } from '@prisma/client';

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
    if (resource.isActive !== false) {
      await notificationService.notifyStudents(
        await notificationService.activeStudentIds(),
        {
          type: NotificationType.PREPARATION_RESOURCE,
          title: 'New preparation resource',
          message: `"${resource.title}" (${resource.topic}) has been added to your preparation library.`,
          relatedId: resource.id,
          relatedType: 'PreparationResource',
        }
      );
    }
    return success(res, resource, 'Preparation resource created', 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const existing = await preparationService.getById(Number(req.params.id));
    const resource = await preparationService.update(Number(req.params.id), req.validated);
    if (existing.isActive === false && resource.isActive === true) {
      await notificationService.notifyStudents(
        await notificationService.activeStudentIds(),
        {
          type: NotificationType.PREPARATION_RESOURCE,
          title: 'New preparation resource',
          message: `"${resource.title}" (${resource.topic}) has been added to your preparation library.`,
          relatedId: resource.id,
          relatedType: 'PreparationResource',
        }
      );
    }
    return success(res, resource, 'Preparation resource updated');
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await preparationService.delete(Number(req.params.id));
    return success(res, null, 'Preparation resource deleted');
  }),
};
