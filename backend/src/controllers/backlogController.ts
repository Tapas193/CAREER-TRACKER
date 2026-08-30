import { Request, Response } from 'express';
import { backlogService } from '../services/backlogService';
import { success, asyncHandler } from '../utils/http';
import { Role } from '@prisma/client';

export const backlogController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const ownerStudentId =
      req.user!.role === Role.ADMIN
        ? Number(req.query.studentId) || undefined
        : req.user!.studentId ?? undefined;
    const data = await backlogService.list({ studentId: ownerStudentId });
    return success(res, data, 'Backlogs fetched');
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const ownerStudentId =
      req.user!.role === Role.ADMIN ? undefined : req.user!.studentId ?? undefined;
    const backlog = await backlogService.getById(Number(req.params.id), ownerStudentId);
    return success(res, backlog, 'Backlog fetched');
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const data = { ...req.validated };
    if (req.user!.role !== Role.ADMIN) {
      data.studentId = req.user!.studentId;
    }
    const backlog = await backlogService.create(data);
    return success(res, backlog, 'Backlog created', 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const ownerStudentId =
      req.user!.role === Role.ADMIN ? undefined : req.user!.studentId ?? undefined;
    const backlog = await backlogService.update(Number(req.params.id), req.validated, ownerStudentId);
    return success(res, backlog, 'Backlog updated');
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const ownerStudentId =
      req.user!.role === Role.ADMIN ? undefined : req.user!.studentId ?? undefined;
    await backlogService.delete(Number(req.params.id), ownerStudentId);
    return success(res, null, 'Backlog deleted');
  }),
};
