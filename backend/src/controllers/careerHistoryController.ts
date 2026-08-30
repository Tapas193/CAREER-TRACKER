import { Request, Response } from 'express';
import { careerHistoryService } from '../services/careerHistoryService';
import { success, asyncHandler } from '../utils/http';
import { Role } from '@prisma/client';

export const careerHistoryController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const ownerStudentId =
      req.user!.role === Role.ADMIN
        ? Number(req.query.studentId) || undefined
        : req.user!.studentId ?? undefined;
    const data = await careerHistoryService.list({ studentId: ownerStudentId });
    return success(res, data, 'Career history fetched');
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const ownerStudentId =
      req.user!.role === Role.ADMIN ? undefined : req.user!.studentId ?? undefined;
    const history = await careerHistoryService.getById(Number(req.params.id), ownerStudentId);
    return success(res, history, 'Career history fetched');
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const data = { ...req.validated };
    if (req.user!.role !== Role.ADMIN) {
      data.studentId = req.user!.studentId;
    }
    const history = await careerHistoryService.create(data);
    return success(res, history, 'Career history created', 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const ownerStudentId =
      req.user!.role === Role.ADMIN ? undefined : req.user!.studentId ?? undefined;
    const history = await careerHistoryService.update(Number(req.params.id), req.validated, ownerStudentId);
    return success(res, history, 'Career history updated');
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const ownerStudentId =
      req.user!.role === Role.ADMIN ? undefined : req.user!.studentId ?? undefined;
    await careerHistoryService.delete(Number(req.params.id), ownerStudentId);
    return success(res, null, 'Career history deleted');
  }),
};
